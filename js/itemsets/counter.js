var async 	= require('async')
var db 		= require('../db').db
var util	= require('util')

var itemsetCounts = exports.itemsetCounts = {}




var getCountFromDbStmt = function(table, itemset) {
	return util.format(
		'SELECT COUNT(*) AS support ' +
		'FROM(' +
			'SELECT txn_id, count(txn_id) AS c ' +
			'FROM %s WHERE item_id IN %s GROUP BY txn_id HAVING c=%d ORDER BY txn_id)', 
		table + '_txn_items', 
		'(' + itemset.toString() + ')',
		itemset.length)
}





var requestCountFromDb = function(table, itemset, callback) {
	async.waterfall([
		function(next) {
			db.get(getCountFromDbStmt(table, itemset), next)
		},
		function(row, next) {
			itemsetCounts[itemset.toString()] = row.support
			callback(null, row.support)
		}
	],
	function(err) {
		console.log('err', err)
	})
	
}





var getCount = exports.getCount = function(table, itemset, callback) {
	var key 	= itemset.toString()
	var count 	= itemsetCounts[key]
	
	if(count) {
		console.log('itemset is cached', itemset)
		callback(null, count)
	} else {
		console.log('itemset not cached', itemset)
		requestCountFromDb(table, itemset, callback)
	}
}