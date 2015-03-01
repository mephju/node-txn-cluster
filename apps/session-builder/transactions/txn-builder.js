
var txnDb 	= require('./db')
var dbHelp 	= require('../../db-help')
var db 		= null
var util 	= require('util')
var async 	= require('async')
var sql 	= require('./sql')
var sqlite3 = require('sqlite3').verbose()



function TxnBuilder(dataset) {

}
TxnBuilder.prototype.buildTxns = function(next) {

}


exports.buildTxns = function(dataset, next) {
	
	db = new sqlite3.Database(dataset.dbPath)

	async.waterfall([
		function(next) {
			txnDb.prepareDb(dataset, next)
		},
		function(next) {
			console.log('prepared')
			txnDb.getUserIds(next)
		}, 
		function(userIds, next) {
			buildTxnsForUsers(dataset, userIds, next)
		},
		function(next) {
			db.run(sql.createIndexStmt(), next)
		},

		function(next) {
			db.run('drop table if exists item_counts', next)
		},
		function(next) {
			dbHelp.getTrainingSetSize(db, next)
		},
		function(trainingSetSize, next) {
			console.log('creating table item_counts')
			db.run(
				'create table 	item_counts		\
				as select 		item_id,  		\
								count(item_id) 	\
								as count 		\
				from 			txn_items 		\
				where 			txn_id  		\
				in 								\
				(select 		txn_id  		\
				from 			txns  			\
				order by 		txn_id 			\
				limit ' + trainingSetSize +') 	\
				group by item_id 				\
				order by count desc',
				next
			);
		},
		function(next) {
			console.log('creating table txns_random')
			db.run(
				'drop table if exists txns_random',
				next

			);
		},
		function(next) {
			db.run(
				'create table txns_random 	\
				as select 	* 				\
				from 		txns 			\
				order by random()',
				next

			);
		}, 
		function(next) {
			db.run('DROP TABLE IF EXISTS txn_item_groups', next)
		},
		function(next) {
			db.run(sql.createTableTxnItemGroups, next)
		},
	], 
	function(err) {
		err && console.log('error building txns for set', err)
		next(err)
	})
}




var buildTxnsForUsers = function(dataset, userIds, callback) {

	var txns = []
	async.eachSeries(
		userIds,
		function(userId, next) {
			console.log('find feedback for user', userId)
			findUserTxns(dataset, userId, txns, next)
		},
		function(err) {
			if(txns.length > 0) {
				txnDb.insertTxns(txns, callback)
			} else {
				callback(err)
			}
		}
	);
}



var findUserTxns = function(dataset, userId, txns, done) {
	
	async.waterfall([
		function(next) {
			txnDb.getUserFeedback(userId, next)
		},
		function(feedbackRows, next) {
			
			var userTxns = findTxnsInFeedback(dataset, feedbackRows)	
			userTxns.forEach(function(txn) {
				txns.push(txn)
			})

			console.log('findUserTxns', txns.length)
			
			if(txns.length > 1000) {
				console.log('insert txns START', txns.length)
				txnDb.insertTxns(txns, function(err) {
					help.clearArray(txns)
					next(err)
				})
			} else {
				next(null)	
			}
		}
	], done)
}




var findTxnsInFeedback = function(dataset, feedbackRows) {
	console.log('findTxnsInFeedback of length', feedbackRows.length)
	var lastItemTimestamp = 0
	var txns = []
	var group = []

	for(var i=0; i<feedbackRows.length; i++) {
		//console.log(feedbackRows[i])
		var row 		= feedbackRows[i]
		var timestamp 	= row.timestamp
		
		if(i !== 0) { 	 
			lastItemTimestamp = feedbackRows[i-1].timestamp 
		}
		
		//is this item of a new transaction
		//console.log('time diff', timestamp - lastItemTimestamp)
		if((timestamp - lastItemTimestamp) > dataset.timeDistance) {
			group = []
			txns.push(group)
		}
		
		group.push(row)
	}

	console.log('txnBuilder.findTxnsInFeedback result', txns.length)

	return txns
}


















