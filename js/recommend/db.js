var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var util		= require('util')

var buildRecomSql = function(itemsPerCluster) {
	var stmts = itemsPerCluster.map(function(num, id) {
		return util.format(
			'SELECT 		item_id ' +
			'FROM 			cluster ' +
			'NATURAL JOIN 	txn_items ' +
			'WHERE 			cluster_id=%d ' +
			'ORDER BY 		random() ' +
			'LIMIT 			%d',
			id,
			num
		);
	})

	stmts = stmts.map(function(stmt) {
		return 'SELECT * FROM (' + stmt + ')' 
	})

	return sql = stmts.reduce(function(previous, current) {
		return previous + ' UNION ALL ' + current
	})

}

var getRecommendations = function(itemsPerCluster, callback) {
	async.waterfall([
		function(next) {
			var sql = buildRecomSql(itemsPerCluster)
			//console.log(sql)
			db.all(sql, next)
		},
		function(rows, next) {
			callback(null, rows.map(function(row) {
				return row['item_id']
			}))
		}
	], callback)
}




exports.getRecommendations = getRecommendations