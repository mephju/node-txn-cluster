



var util 	= require('util')
var sql 	= require('./sql')




function TxnBuilder(dataset) {
	 var TxnModel = require('./model').Model
	this.model = new TxnModel(dataset)
}
exports.TxnBuilder = TxnBuilder

TxnBuilder.prototype.buildTxns = function(next) {
	
	var builder = this

	async.waterfall([
		function(next) {
			builder.model.prepareDb(next)
		},
		function(next) {
			console.log('prepared')
			builder.model.getUserIds(next)
		}, 
		function(userIds, next) {
			builder.buildTxnsForUsers(userIds, next)
		},
		function(next) {
			builder.model.db.run(sql.createIndexStmt(), next)
		},

		function(next) {
			builder.model.db.run('drop table if exists item_counts', next)
		},
		function(next) {
			help.getTrainingSetSize(builder.model.db, next)
		},
		function(trainingSetSize, next) {
			console.log('creating table item_counts')
			builder.model.db.run(
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
			builder.model.db.run(
				'drop table if exists txns_random',
				next

			);
		},
		function(next) {
			builder.model.db.run(
				'create table txns_random as 	\
					select 	* 				\
					from 		txns 			\
					order by random()',
				next

			);
		}, 
		function(next) {
			builder.model.db.run('DROP TABLE IF EXISTS txn_item_groups', next)
		},
		function(next) {
			builder.model.db.run(
				'CREATE TABLE IF NOT EXISTS	txn_item_groups AS \
					SELECT 			txn_id, group_concat(item_id) as item_ids \
					FROM 			txn_items \
					GROUP BY 		txn_id \
					ORDER BY  		random()',
				next
			);

		},
	], 
	function(err) {
		err && console.log('error building txns for set', err)
		next(err)
	})
}




TxnBuilder.prototype.buildTxnsForUsers = function(userIds, callback) {

	var txns = []
	var builder = this

	async.eachSeries(
		userIds,
		function(userId, next) {
			console.log('find feedback for user', userId)
			builder.findUserTxns(userId, txns, next)
		},
		function(err) {
			if(txns.length > 0) {
				builder.model.insertTxns(txns, callback)
			} else {
				callback(err)
			}
		}
	);
}



TxnBuilder.prototype.findUserTxns = function(userId, txns, done) {
	var builder = this
	async.waterfall([
		function(next) {
			builder.model.getUserFeedback(userId, next)
		},
		function(feedbackRows, next) {
			
			var userTxns = builder.findTxnsInFeedback(feedbackRows)	
			userTxns.forEach(function(txn) {
				txns.push(txn)
			})

			console.log('findUserTxns', txns.length)
			
			if(txns.length > 1000) {
				console.log('insert txns START', txns.length)
				builder.model.insertTxns(txns, function(err) {
					help.clearArray(txns)
					next(err)
				})
			} else {
				next(null)	
			}
		}
	], done)
}




TxnBuilder.prototype.findTxnsInFeedback = function(feedbackRows) {
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
		if((timestamp - lastItemTimestamp) > this.model.dataset.timeDistance) {
			group = []
			txns.push(group)
		}
		
		group.push(row)
	}

	console.log('txnBuilder.findTxnsInFeedback result', txns.length)

	return txns
}


















