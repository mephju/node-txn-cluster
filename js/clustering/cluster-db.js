var async 		= require('async')
var sql 		= require('./cluster-db-sql')
var sqlite3		= require('sqlite3').verbose()
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var config		= require('../config')



var insertClusterStmt = null
var insertCentroidStmt = null


var insert = function(centroidColl, callback) {
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
			bulkInsertClusters(centroidColl, next)
		},
		function(next) {
			bulkInsertCentroids(centroidColl, next)
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	], callback)
}




var bulkInsertClusters = function(centroidColl, callback) {
	async.eachSeries(
		centroidColl.centroids,
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



var bulkInsertCentroids = function(centroidColl, callback) {
	async.eachSeries(
		centroidColl.centroids,
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


//callback(err [,centroidVectors])
var getCentroidRows = function(callback) {
	async.waterfall([
		function(next) {
			console.log('getCentroidRows','SELECT');
			db.all('SELECT * FROM centroid;', next);
		},
		function(rows, next) {
			console.log('getCentroidRows', rows.length)
			callback(null, rows)
		}
	], callback)
}





exports.insert = insert
exports.getCentroidRows = getCentroidRows