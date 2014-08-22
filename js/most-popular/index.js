var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var txnDb		= require('../transactions/db')
var util		= require('util')
var config 		= require('../config')

var popularItemMap = {}


var buildItemMap = function(popularItems) {
	console.log('buildItemMap')
	var popularItemMap = {}
	for(var i=1; i<=popularItems.length; i++) {
		popularItemMap[i] = popularItems.slice(0, i)
	}
	return popularItemMap
}


var getPopularItemsForN = function(n) {
	//console.log('getPopularItemsForN', popularItemMap[n])
	return popularItemMap[n]
}


//
// get most popular items from the training set
//
var getPopularItemsSql = function(n, trainingSize) {
	return 'select 	item_id, 	\
				count(item_id) 	\
				as count 		\
	from 		txn_items 		\
	where 		txn_id  		\
	in 							\
	(select 	txn_id 			\
	from 		txns 			\
	order by 	txn_id			\
	limit ' + 	trainingSize +')\
	group by 	item_id			\
	order by 	count desc  	\
	limit ' 	+ config.N
}


var init = function(arg1, arg2) {

	if(arg2) {
		callback = arg2
	} else {
		callback = arg1
	}

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
			rows.forEach(function(row, i) {
				rows[i] = row['item_id']
			})
			next(null, rows)
		},
		function(items) {
			console.log(items.length)
			popularItemMap = buildItemMap(items)
			callback(null)
		}
	], callback)
}


var recommend = function(sessionBegin, n) {
	return getPopularItemsForN(n)
}
	


exports.init = init
exports.recommend = recommend
exports.reset = function() {}
exports.getPopularItemsForN = getPopularItemsForN