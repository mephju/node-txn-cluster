
var sqlite3		= require('sqlite3').verbose()
var txnDb		= require('../transactions/db')


function Model(dataset) {
	this.dataset = dataset
	this.db = new sqlite3.Database(dataset.dbPath)
}

exports.Model = Model


Model.prototype.insertSimMatrix = function(matrix, done) {
	var model = this
	async.waterfall([
		function(next) {
			model.db.run('DROP TABLE IF EXISTS txn_sim_matrix', next)
		},
		function(next) {
			model.db.run(
				'CREATE TABLE txn_sim_matrix( \
				txn_id INTEGER PRIMARY KEY, \
				similarities TEXT)',
				next
			);
		},
		function(next) {
			model.db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			async.eachSeries(
				matrix.txnRows,
				function(txnRow, next) {
					var txnId = txnRow['txn_id']
					var simRow = matrix.getRowForTxnId(txnId)
					model.db.run('INSERT INTO txn_sim_matrix VALUES($1, $2)', [txnId, simRow.toString()], next)
				},
				next
			);
		},
		function(next) {
			model.db.run('END TRANSACTION', next)
		}
	], done)
}


Model.prototype.getSimMatrix = function(done, testTxnRows) {
	var txnRows = null
	var matrixSimRows = null
	var model = this
	
	async.waterfall([
		function(next) {
			if(testTxnRows) {
				txnRows = testTxnRows
				return next(null, txnRows)
			} 
			txnDb.getAllTxns(next)	
		},
		function(rows, next) {
			txnRows = rows
			model.db.all('SELECT * FROM txn_sim_matrix', next)
		},
		function(rows, next) {
			//row[0] = { txn_id:123, similarities:[0,1,0] }
			matrixSimRows = rows
			next(null)
		}
	], function(err) {
		done(err, txnRows, matrixSimRows)
	});
}

