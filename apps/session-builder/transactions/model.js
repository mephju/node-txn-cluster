var sql 		= require('./sql')


function Model(dataset) {
	app.Model.call(this, dataset)

	this.asSets = this.dataset.config.DISTANCE_MEASURE === 'jaccard'

	this.table = {
		clusterMembers: this.dataset.prefixTableName('cluster_members'),
		txnItemGroups: 	this.prefixTableName(dataset.config.CROSS_VALIDATION_RUN, 'txn_item_groups')
	} 
}

Model.prototype = Object.create(app.Model.prototype, {
	constructor: Model
})

module.exports = Model

Model.prototype.prefixTableName = function(run, name) {
	return 'cross_validation_run_' + run + '_' + name
}


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








/**
 * Clustered txns are those txns of the training set which could be assigned
 * to a cluster. 
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
Model.prototype.getClusteredTxns = function(done) {
	var sql = 'select txn_id, item_ids from ' + this.table.clusterMembers
	
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
			if(model.asSets) {
				toSortedSets(rows)
			}
			done(null, rows)
		}
	], done)
}

Model.prototype.txns = function(done) {
	this._txns('select * from txn_item_groups_original order by txn_id asc', done)
}
Model.prototype.txnsForValidation = function(done) {
	this._getAllTxns(true, done)
}
Model.prototype.txnsForTraining = function(done) {
	log('txnsForTraining')
	this._getAllTxns(false, done)
}

// 
// Returns all txnRows for either training set or validation set
// 
Model.prototype._getAllTxns = function(validation, done) {
	
	async.wfall([
		function(next) {
			this.tableSize(this.table.txnItemGroups, next)
		},
		function(tableSize, next) {
			var trainingSize = Math.floor(tableSize * this.dataset.config.TRAINING_SET_SIZE)
			
			log('TRAINING SET SIZE', this.dataset.config.TRAINING_SET_SIZE, trainingSize)
			
			var sql = 'SELECT txn_id, item_ids FROM ' + this.table.txnItemGroups + ' LIMIT ' + trainingSize
	
			if(validation) {
				sql = 'SELECT txn_id, item_ids FROM ' + this.table.txnItemGroups + ' LIMIT 9999999999 OFFSET ' + trainingSize	
			} 
			this._txns(sql, next, validation);
		},  
		function(txns, next) {
			done(null, txns)
		}
	], this, done)
}



Model.prototype._txns = function(sql, done, validation) {
	
	var config = this.dataset.config
	var self = this
	async.waterfall([
		function(next) {
			var statement = this.db.prepare(sql)
			// this.db.all(sql, next);
			statement.all(next);
		}.bind(this),
		function(rows, next) {
			rows = rows.filter(function(row, i) {
				row['item_ids'] = help.textToNumArray(row['item_ids'])
				return !validation || row['item_ids'].length > config.N //if validation, the txns should have a minimum length 
			})
			if(self.asSets) {
				toSortedSets(rows)
			}
			done(null, rows)
		}
	], done)
}

var toSortedSets = function(txnRows) {
	txnRows.forEach(function(txnRow) {
		txnRow['item_ids'] = _.unique(txnRows['item_ids']).sort()
	})
}



