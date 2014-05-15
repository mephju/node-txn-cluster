
var txnDb 	= require('./db')
var db 		= txnDb.db
var util 	= require('util')
var async 	= require('async')
var sql 	= require('./sql')






exports.buildTxnsForSet = function(set, next) {
	async.waterfall([
		function(next) {
			txnDb.prepareDb(set, next)
		},
		function(next) {
			console.log('prepared')
			txnDb.getUserIds(set, next)
		}, 
		function(userIds, next) {
			buildTxns(userIds, set, next)
		},
		function(next) {
			txnDb.db.run(sql.createIndexStmt(set.dbTable), next)
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




var buildTxns = function(userIds, dataset, callback) {

	async.eachSeries(
		userIds,
		function(userId, next) {

			txnDb.getUserFeedback(userId, dataset, function(e, feedbackRows) {
				var feedbackGroups = findFeedbackGroups(feedbackRows, dataset)
				txnDb.insertTxns(dataset.dbTable, feedbackGroups, next)
			})
		},
		function(err) {
			callback(err)
		}
	);
}





var findFeedbackGroups = function(feedbackRows, dataset) {
	
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

	console.log('txnBuilder.findFeedbackGroups result' + feedbackGroups.length)

	return feedbackGroups
}


















