var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var txnDb		= require('../transactions/db')
var util		= require('util')

var popularItemMap = {}


var buildItemMap = function(popularItems) {
	var popularItemMap = {}
	for(var i=1; i<=popularItems.length; i++) {
		popularItemMap[i] = popularItems.slice(0, i)
	}
	return popularItemMap
}


var getPopularItemsForN = function(n) {
	console.log('getPopularItemsForN', popularItemMap[n])
	return popularItemMap[n]
}


//
// get most popular items from the training set
//
var getPopularItemsSql = function(n, trainingSize) {

	return util.format(
		'SELECT 	 item_id '+
		'FROM('+
		'SELECT 	count(*) AS	count, item_id ' +
		'FROM 		txn_items ' +
		'WHERE 		txn_id ' +
		'IN(' +
		'	SELECT 		txn_id ' +
		'	FROM 		txns ' +
		'	ORDER BY 	txn_id ' +
		'	LIMIT 		%d ' +
		')' +
		'GROUP BY 	item_id ' + 
		'ORDER BY 	count ' +
		'DESC ' +
		'LIMIT 		%d )',
		trainingSize,
		n

	);
}


var init = function(callback) {
	console.log('mostpopular.init')
	async.waterfall([
		function(next) {
			txnDb.getTxnIdsForTraining(next)
		},
		function(txnIds, next) {
			
			var sql = getPopularItemsSql(500, txnIds.length)

			db.all(sql, next)
		},
		function(rows, next) {

			next(null, rows.map(function(row) {
				return row['item_id']
			}))
		},
		function(items) {
			console.log(items.length)
			popularItemMap = buildItemMap(items)
			callback(null)
		}
	], callback)
}


var recommend = function(n, callback) {

	callback(null, getPopularItemsForN(n))
}
	


exports.init = init
exports.recommend = recommend
exports.getPopularItemsForN = getPopularItemsForN