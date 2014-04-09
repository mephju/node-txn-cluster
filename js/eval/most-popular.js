var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var txnDb		= require('../transactions/db')
var util		= require('util')

var getSql = function(n, trainingSize) {

	return util.format(
		'SELECT 	 item_id '+
		'FROM('+
		'SELECT 	count(*) AS	count, item_id ' +
		'FROM 		txn_items ' +
		'WHERE 		txn_id ' +
		'IN(' +
		'	SELECT 	txn_id ' +
		'	FROM 	txns ' +
		'	LIMIT 	%d ' +
		')' +
		'GROUP BY 	item_id ' + 
		'ORDER BY 	count ' +
		'DESC ' +
		'LIMIT 		%d )',
		trainingSize,
		n

	);
}


var recommend = function(n, callback) {

	async.waterfall([
		function(next) {
			txnDb.getTxnIdsForTraining(next)
		},
		function(txnIds, next) {
			console.log('mostpopular.recommend')
			var sql = getSql(n, txnIds.length)
			db.all(sql, next)
		},
		function(rows) {
			callback(null, rows.map(function(row) {
				return row['item_id']
			}))
		}
	], callback)
}
	


exports.recommend = recommend