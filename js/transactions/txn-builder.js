
var txnDb 	= require('./db')
var db 		= txnDb.db
var util 	= require('util')
var async 	= require('async')
var sql 	= require('./sql')
var dataset		= require('../dataset-defs').dataset()





exports.buildTxnsForSet = function(next) {
	async.waterfall([
		function(next) {
			txnDb.prepareDb(next)
		},
		function(next) {
			console.log('prepared')
			txnDb.getUserIds(next)
		}, 
		function(userIds, next) {
			buildTxns(userIds, next)
		},
		function(next) {
			txnDb.db.run(sql.createIndexStmt(), next)
		},
		function(next) {
			txnDb.db.run('DROP TABLE IF EXISTS txn_item_groups', next)
		},
		function(next) {
			txnDb.db.run(sql.createTableTxnItemGroups, next)
		}
	], 
	function(err) {
		err && console.log('error building txns for set', err)
		next(err)
	})
}




var buildTxns = function(userIds, callback) {

	var feedbackGroups = []
	async.eachSeries(
		userIds,
		function(userId, next) {
			findUserTxns(userId, feedbackGroups, next)
		},
		function(err) {
			if(feedbackGroups.length > 0) {
				txnDb.insertTxns(feedbackGroups, callback)
			} else {
				callback(err)
			}
		}
	);
}



var findUserTxns = function(userId, feedbackGroups, done) {
	
	async.waterfall([
		function(next) {
			txnDb.getUserFeedback(userId, next)
		},
		function(feedbackRows, next) {
			
			var output = findFeedbackGroups(feedbackRows)	

			feedbackGroups.push.apply(feedbackGroups, output)
			if(feedbackGroups.length > 1000) {
				txnDb.insertTxns(feedbackGroups, function(err) {
					feedbackGroups = []
					next(err)
				})
			} else {
				next(null)	
			}
		}
	], done)
}





var findFeedbackGroups = function(feedbackRows) {
	
	var lastItemTimestamp = 0
	var feedbackGroups = []
	var group

	for(var i=0; i<feedbackRows.length; i++) {
		var row = feedbackRows[i]
		var timestamp = row.timestamp
		
		if(i !== 0) { 	 
			lastItemTimestamp = feedbackRows[i-1].timestamp 
		}
		
		//is this item of a new transaction
		if((timestamp - lastItemTimestamp) > dataset.timeDistance) {
			group = []
			feedbackGroups.push(group)
		}
		
		group.push(row)
	}

	console.log('txnBuilder.findFeedbackGroups result', feedbackGroups.length)

	return feedbackGroups
}


















