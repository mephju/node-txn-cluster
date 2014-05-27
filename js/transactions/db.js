
var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var sql 		= require('./sql')
var async 		= require('async')
var rootDb		= require('../db')
var config		= require('../config')
var help 		= require('../help')





exports.prepareDb = function(callback) {

	console.log('preparing txn tables for ' + dataset.dbTable)

	async.waterfall([
		function(next) {
			db.run('DROP TABLE IF EXISTS txns', next) 
		},
		function(next) {
			db.run('DROP TABLE IF EXISTS txn_items', next)
		},
		function(next) {
			db.run(sql.createTxnsStmt(), next)
		},
		function(next) {
			db.run(sql.createTxnItemsStmt(), next)		
		},
		function(next) {
			insertTxnStmt = db.prepare(sql.insertTxnStmt(), next)
		},
		function(next) {
			insertTxnItemStmt = db.prepare(sql.insertTxnItemStmt(), next)
		}
		
	], callback)

}




exports.getUserFeedback = function(id, callback) {
	db.all(
		'SELECT * FROM feedback WHERE user_id=? ORDER BY timestamp ASC', 
		[id], 
		callback
	);
}




var inscount = 1
exports.insertTxns = function(feedbackGroups, callback) {
	
	function insertIntoTxns(groups, callback) {

		
		async.eachSeries(
			groups,
			function(group, next) {
			
				var userId = group[0]['user_id']

				insertTxnStmt.run(userId, function(e) {
					e && console.log(e)
					var txnId = this.lastID
					console.log('txnBuilder.insertIntoTxnItems %d, %d, count %d', txnId, group.length, inscount++)
					insertIntoTxnItems(txnId, group, next)
				})
			},
			callback
		);
	}


	function insertIntoTxnItems(txnId, group, callback) {		
		async.eachSeries(
			group,
			function(feedbackRow, next) {
				insertTxnItemStmt.run([txnId, feedbackRow['item_id']], next)
			}, 
			callback
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



exports.getUserIds = function(callback) {

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



var getTxnIdsForValidation = function(callback) {
	async.waterfall([
		function(next) {
			rootDb.getTableSize('txns', next)
		},
		function(size, next) {
			var trainingSetSize = Math.floor(size*config.TRAINING_SET_SIZE)
			getTxnIdsHelper(
				'SELECT txn_id from txns LIMIT 999999999 OFFSET ' + trainingSetSize, 
				callback
			);
		}
	], callback)
}





//
// Returns all txn ids from the training set which are actually about 80% 
// of all txns
//

var getAllTxnIds = function(callback) {
	 
	async.waterfall([
		function(next) {
			rootDb.getTableSize('txns', next)
		},
		function(size, next) {
			var trainingSize = Math.floor(size*config.TRAINING_SET_SIZE)
			console.log(config.TRAINING_SET_SIZE, trainingSize)
			getTxnIdsHelper(sql.getAllTxnIds(trainingSize), callback);
		}
	], callback)	
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



// 
// Returns all txnRows for either training set or validation set
// 
var getAllTxns = function(done, validation) {

	async.waterfall([
		function(next) {
			rootDb.getTableSize('txns', next)
		},
		function(tableSize, next) {
			var trainingSize = Math.floor(tableSize * config.TRAINING_SET_SIZE)
			console.log('TRAINING SET SIZE', config.TRAINING_SET_SIZE, trainingSize)
			
			if(validation) {
				db.all(
					'SELECT DISTINCT txn_id, item_ids FROM txn_item_groups LIMIT 999999999 OFFSET ' + trainingSize, 
					next
				);
			} 
			else {
				db.all(
					'SELECT DISTINCT txn_id, item_ids FROM txn_item_groups LIMIT ' + trainingSize, 
					next
				);
			}
				
		},  
		function(rows, next) {			
			rows.forEach(function(row, i) {
				row['item_ids'] = help.textToNumArray(row['item_ids'])
			})
			done(null, rows)
		}
	], done)
}


var getManyTxns = function(txnIds, callback) {
	console.log('get many txns', txnIds.length)
	var txns = []
	var sqlstmt = 'SELECT item_ids FROM txn_item_groups WHERE txn_id IN' + 
		'(' + txnIds.toString() + ')'

	db.all(sqlstmt, function(err, rows) {
		if(err) {
			console.log(err)
			callback(err)
		} else {
			console.log('got txns', rows.length)
			callback(null, rows.map(function(row) {
				return row['item_ids'].split(',').map(function(itemIdString) {
					return parseInt(itemIdString)
				})
			}))
		}

	})
}


exports.getManyTxns = getManyTxns
exports.getAllTxns = getAllTxns
exports.getTxnIdsForValidation = getTxnIdsForValidation
exports.getTxnIdsForTraining = getAllTxnIds
exports.getAllTxnIds = getAllTxnIds
