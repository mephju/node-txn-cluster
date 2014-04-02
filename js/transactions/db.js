
var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var sql 		= require('./sql')
var async 		= require('async')





exports.prepareDb = function(dataset, callback) {

	console.log('preparing txn tables for ' + dataset.dbTable)

	async.waterfall([
		function(next) {
			db.run(sql.createTxnsStmt(), next)
		},
		function(next) {
			db.run(sql.createTxnItemsStmt(), next)		
		},
		function(next) {
			db.run('DELETE FROM txns', next) 
		},
		function(next) {
			db.run('DELETE FROM txn_items', next)
		}
	], callback)

}




exports.getUserFeedback = function(id, dataset, callback) {
	console.log('txnBuilder.getUserFeedback for ' + id)
	
	var rows = []
	db.each(
		'SELECT * FROM feedback WHERE user_id=? ORDER BY timestamp ASC', 
		[id], 
		function(e, row) { rows.push(row) },
		function(e, numRows) {
			console.log('txnBuilder.getUserFeedback for ' + id + ' found rows ' + rows.length)
			callback(e, rows)
		}
	)
}




exports.insertTxns = function(table, feedbackGroups, callback) {
	
	function insertIntoTxns(groups, callback) {

		var insertStmt = db.prepare(sql.insertTxnStmt())
		async.eachSeries(
			groups,
			function(group, next) {
			
				var userId = group[0]['user_id']

				insertStmt.run(userId, function(e) {
					e && console.log(e)
					var txnId = this.lastID
					insertIntoTxnItems(txnId, group, next)
				})
			},
			function(err) {
				callback(err)
			}
		);
	}


	function insertIntoTxnItems(txnId, group, callback) {

		console.log('txnBuilder.insertIntoTxnItems %d, %d', txnId, group.length)
		var insertStmt = db.prepare(sql.insertTxnItemStmt())
		async.eachSeries(
			group,
			function(feedbackRow, next) {
				insertStmt.run([txnId, feedbackRow['item_id']], next)
			}, 
			function(err) {
				callback(err)
			}
		);
	}

	
	
	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		}, 
		function(next) {
			insertIntoTxns(feedbackGroups, next)		
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	],
	function(err) {
		console.log('txnBuilder.insertTxns', 'done', feedbackGroups.length)
		callback(err)
	})
	
	
}



exports.getUserIds = function(set, callback) {

	var result;
	async.waterfall([
		function(next) {
			db.all(sql.getUserIdsStmt(), next)
		},
		function(rows, next) {
			result = rows.map(function(row) { return row['user_id'] })
			next(null)
		}
	],
	function(err) {
		console.log('got user ids', result)
		callback(err, result)
	})
}





exports.getTxn = function(txnId, callback) {
	db.all(
		sql.getTxnItemsStmt(),
		txnId, 
		function(e, rows) {

			if(e) {
				callback(e) 		
			} else {
				var txn = rows.map(function(row) {
					return row['item_id']
				})
				callback(null, txn)
			}
			
		}
	);
}




exports.getAllTxnIds = function( callback) {
	getTxnIdsHelper(
		sql.getAllTxnIds(),
		callback
	);
}

exports.getTxnIds = function(dataset, callback) {
	getTxnIdsHelper(
		sql.getTxnIdsStmt(dataset.dbTable),
		callback
	);
}

var getTxnIdsHelper = function(sql, callback) {
	db.all(
		sql,
		function(e, rows) {
			if(e) { callback(e) }
			else { 
				var txnIds = rows.map(function(row) {
					return row['txn_id']
				})
				callback(null, txnIds)
			}			
		}
	);
}

