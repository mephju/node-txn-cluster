
var sqlite3		= require('sqlite3').verbose()

var sql 		= require('./sql')
var async 		= require('async')
var db 			= null 


function Model(dataset) {
	app.Model.call(this, dataset)
}
Model.prototype = Object.create(app.Model.prototype, {
	constructor: Model
})

exports.Model = Model


Model.prototype.prepareDb = function(callback) {

	console.log('preparing txn tables for ' + this.dataset.name)
	var model = this

	async.waterfall([
		function(next) {
			model.db.run('DROP TABLE IF EXISTS txns', next) 
		},
		function(next) {
			model.db.run('DROP TABLE IF EXISTS txn_items', next)
		},
		function(next) {
			model.db.run(sql.createTxnsStmt(), next)
		},
		function(next) {
			model.db.run(sql.createTxnItemsStmt(), next)		
		},
		function(next) {
			insertTxnStmt = model.db.prepare(sql.insertTxnStmt(), next)
		},
		function(next) {
			insertTxnItemStmt = model.db.prepare(sql.insertTxnItemStmt(), next)
		}
		
	], callback)

}




Model.prototype.getUserFeedback = function(id, callback) {

	this.db.all(
		'SELECT * FROM feedback WHERE user_id=? ORDER BY timestamp ASC', 
		[id], 
		callback
	);
}




Model.prototype.insertTxns = function(feedbackGroups, callback) {
	var model = this
	log('txndb.insertTxns', feedbackGroups.length)
	function insertIntoTxns(groups, callback) {

		
		async.eachSeries(
			groups,
			function(group, next) {
			
				var userId = group[0]['user_id']

				insertTxnStmt.run(userId, function(e) {
					e && console.log(e)
					var txnId = this.lastID
					//log('txnBuilder.insertIntoTxnItems %d, %d, count %d', txnId, group.length, inscount++)
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
			model.db.run('BEGIN TRANSACTION', next)
		}, 
		function(next) {
			insertIntoTxns(feedbackGroups, next)		
		},
		function(next) {
			model.db.run('END TRANSACTION', next)
		}
	],
	function(err) {
		console.log('txnBuilder.insertTxns', 'done', feedbackGroups.length)
		callback(err)
	})
}



Model.prototype.getUserIds = function(callback) {
	var model = this
	var result;
	async.waterfall([
		function(next) {
			model.db.all(sql.getUserIdsStmt(), next)
		},
		function(rows, next) {
			result = rows.map(function(row) { return row['user_id'] })
			next(null)
		}
	],
	function(err) {
		//console.log('got user ids', result)
		callback(err, result)
	})
}





Model.prototype.getTxn = function(txnId, callback) {
	this.db.all(
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






Model.prototype.getTxnIdsHelper = function(sql, callback) {
	this.db.all(
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



Model.prototype.getManyTxns = function(txnIds, callback) {
	console.log('get many txns', txnIds.length)
	var txns = []
	var sqlstmt = 'SELECT item_ids FROM txn_item_groups WHERE txn_id IN' + 
		'(' + txnIds.toString() + ')'

	this.db.all(sqlstmt, function(err, rows) {
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




/**
 * Clustered txns are those txns of the training set which could be assigned
 * to a cluster. 
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
Model.prototype.getClusteredTxns = function(done) {
	var sql = 'select txn_id, item_ids from cluster_members'
	
	var model = this

	async.waterfall([
		function(next) {
			model.db.all(sql, next)
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = JSON.parse('[' + row['item_ids'] + ']')
				//console.log(JSON.stringify(row))
			})
			done(null, rows)
		}
	], done)
}

// 
// Returns all txnRows for either training set or validation set
// 
Model.prototype.getAllTxns = function(done, validation) {

	async.waterfall([
		function(next) {
			model.getTableSize('txns', next)
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

Model.prototype.getTxnsForTraining = function(done) {
	
	var model = this

	async.waterfall([
		function(next) {
			help.getTrainingSetSize(model.db, next)
		},
		function(trainingSetSize, next) {
			log('TRAINING SET SIZE', config.TRAINING_SET_SIZE, trainingSetSize)
				
			model.db.all(
				'SELECT DISTINCT txn_id, item_ids FROM txn_item_groups LIMIT ' + trainingSetSize, 
				next
			);
		},  
		function(rows, next) {			
			rows.forEach(function(row, i) {
				row['item_ids'] = help.textToNumArray(row['item_ids'])
			})
			done(null, rows)
		}
	], done)
}



//
// getTxnBatches(txnIds, onBatch, callback)
// getTxnBatches(onBatch, callback)
// onBatch(idbatch, txnbatch, next);
// 
Model.prototype.getTxnBatches = function() {

	var arglen = arguments.length
	var callback = arguments[arglen-1]
	var onBatch = null

	var model = this

	var processIdBatches = function(txnIds, next) {
		var txnIdBatches = help.toBatches(txnIds)
		this._forTxnIdBatches(txnIdBatches, onBatch, next)
	}

	if(arglen === 3) {
		var txnIds = arguments[0]
		onBatch = arguments[1]
		processIdBatches(txnIds, callback)
	} else if(arglen === 2) {
		onBatch = arguments[0]
		async.waterfall([
			model.getAllTxnIds,
			processIdBatches
		], callback)
	}
}




Model.prototype._forTxnIdBatches = function(txnIdBatches, onBatch, callback) {
	var model = this

	async.eachSeries(
		txnIdBatches,
		function(txnIdBatch,  next) {
			async.waterfall([
				function(next) {
					model.getManyTxns(txnIdBatch, next)
				},
				function(txnBatch, next) {
					console.log('got batch from db', txnIdBatch.length)
					onBatch(txnIdBatch, txnBatch, next)
				}
			],
			next)

		},
		callback
	);
}