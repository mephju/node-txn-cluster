var async 		= require('async')
var sqlite3		= require('sqlite3').verbose()
var config		= require('../config')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var txnDb		= require('../transactions/db')



var insertSimMatrix = function(matrix, done) {
	async.waterfall([
		function(next) {
			db.run('DROP TABLE IF EXISTS txn_sim_matrix', next)
		},
		function(next) {
			db.run(
				'CREATE TABLE txn_sim_matrix( \
				txn_id INTEGER PRIMARY KEY, \
				similarities TEXT)',
				next
			);
		},
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			async.eachSeries(
				matrix.txnRows,
				function(txnRow, next) {
					var txnId = txnRow['txn_id']
					var simRow = matrix.getRowForTxnId(txnId)
					db.run('INSERT INTO txn_sim_matrix VALUES($1, $2)', [txnId, simRow.toString()], next)
				},
				next
			);
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	], done)
}


var getSimMatrix = function(done) {
	var txnRows = null
	var matrixSimRows = null

	async.waterfall([
		function(next) {
			txnDb.getAllTxns(next)
		},
		function(rows, next) {
			txnRows = rows
			db.all('SELECT * FROM txn_sim_matrix', next)
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

exports.insertSimMatrix 	= insertSimMatrix
exports.getSimMatrix 		= getSimMatrix