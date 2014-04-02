var async 		= require('async')
var sql 		= require('./cluster-db-sql')
var sqlite3		= require('sqlite3').verbose()
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var config		= require('../config')



var insertClusterStmt = null
var insertCentroidStmt = null


var insert = function(centroids, callback) {
	async.waterfall([
		function(next) {
			db.run(sql.cluster.drop(), next)
		},
		function(next) {
			db.run(sql.centroid.drop(), next)
		},
		function(next) {
			db.run(sql.cluster.create(), next)
		},
		function(next) {
			db.run(sql.centroid.create(), next)
		},
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			insertClusterStmt = db.prepare(sql.cluster.insert(), next)
		},
		function(next) {
			insertCentroidStmt = db.prepare(sql.centroid.insert(), next)
		},
		function(next) {
			bulkInsertClusters(centroids, next)
		},
		function(next) {
			bulkInsertCentroids(centroids, next)
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	], callback)
}




var bulkInsertClusters = function(centroids, callback) {
	async.eachSeries(
		centroids,
		function(centroid, next) {
			insertOneCluster(centroid, next)
		},
		function(err) {
			callback(err)
		}
	);
}




var insertOneCluster = function(centroid, callback) {
	async.eachSeries(
		centroid.txnIds,
		function(txnId, next) {
			insertClusterStmt.run(centroid.id, txnId, next)
		},
		function(err) {
			callback(err)
		}
	);
} 



var bulkInsertCentroids = function(centroids, callback) {
	async.eachSeries(
		centroids,
		function(centroid, next) {
			insertCentroidStmt.run(
				centroid.id, 
				JSON.stringify(centroid.vector),
				next
			);
		},
		function(err) {
			callback(err)
		}
	);
}





exports.insert = insert