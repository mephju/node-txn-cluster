var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var util		= require('util')




// var getItemsSql = function(id, num) {
// 	return util.format(
// 		'SELECT 		item_id ' +
// 		'FROM 			cluster_items ' +
// 		'WHERE 			cluster_id=%d ' +
// 		'ORDER BY 		count DESC ' +
// 		'LIMIT 			%d',
// 		id,
// 		num
// 	);
// }



var getItemsSql = function(id, num) {
	return util.format(
		'SELECT 		item_id ' +
		'FROM 			cluster_items ' +
		'WHERE 			cluster_id=%d ' +
		'ORDER BY 		random() ' +
		'LIMIT 			%d',
		id,
		num
	);
}



var createViewClusterItems = function() {
	return 'CREATE TABLE IF NOT EXISTS cluster_items AS  '  +
	'SELECT 		cluster_id, item_id, count ' +
	'FROM 			cluster  ' +
	'NATURAL JOIN 	txn_items ' +
	'NATURAL JOIN(  SELECT 		item_id, count(*)  ' +
	'				AS 			count ' +
	'				FROM 		feedback ' +
	'				GROUP BY 	item_id ' +
	'				ORDER BY 	count DESC) ' +
	'ORDER BY  		cluster_id ASC, ' +
	'				count DESC; ';
}





//get random amount of items from a certain cluster
var buildRecomSql = function(itemsPerCluster) {
	var stmts = itemsPerCluster.map(function(num, id) {
		return getItemsSql(id, num)
	})

	stmts = stmts.map(function(stmt) {
		return 'SELECT * FROM (' + stmt + ')' 
	})

	return sql = stmts.reduce(function(previous, current) {
		return previous + ' UNION ALL ' + current
	})

}

var getRecommendations = function(numRecommsPerCluster, callback) {
	async.waterfall([
		function(next) {
			var sql = buildRecomSql(numRecommsPerCluster)
			db.all(sql, next)
		},
		function(rows, next) {
			callback(null, rows.map(function(row) {
				return row['item_id']
			}))
		}
	], callback)
}



var getItemsForCluster = function(clusterId, callback) {
	console.log('getItemsForCluster', clusterId)
	async.waterfall([
		function(next) {
			var sql = getItemsSql(clusterId, 9999999999)
			db.all(sql, next)
		},
		function(rows, next) {
			console.log('getItemsForCluster.gotRows', rows.length)
			callback(null, rows.map(function(row) {
				return row['item_id']
			}))
		}
	], callback)	
}


exports.getRecommendations = getRecommendations
exports.getItemsForCluster = getItemsForCluster