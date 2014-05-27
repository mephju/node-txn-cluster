var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup
var db 			= require('./db')
var simMatrix	= require('./sim-matrix')


var cluster = function(txnRows, matrix, done) {

	console.log('cluster')
	var clusters = init(txnRows, matrix)
	console.log('cluster2', clusters)
	clusterGroup = clusterIterate(txnRows, clusters)
	console.log('cluster3')
	done(null, clusterGroup)
}


var clusterIterate = function(txnRows, clusters) {
	if(clusters.isIterationNeeded) {
		clusters.clear()
		console.log('clusterIterate ', txnRows.length)
		txnRows.forEach(function(txnRow) {
			clusters.assign(txnRow)
		})
		clusters.recomputeCentroids()
		return clusterIterate(txnRows, clusters)
	} else {
		return clusters
	}	
}



var init = function(txnRows, matrix) {
	console.log('clustering.init')
	var K = Math.max(
		config.NUM_CENTROIDS, 
		4
	);
	var max 	= txnRows.length - 1

	var centroids 		= []
	var clusters	 	= []

	while(centroids.length < K) {
		console.log('rand K', K)


		var randomIdx = Math.floor(Math.random() * max)
		var centroid = txnRows[randomIdx]
		
		if(centroids.indexOf(centroid) === -1) {
			centroids.push(centroid)
			clusters.push(new Cluster(matrix, centroid))
		}
	}

	var clusters = new ClusterGroup(clusters)
	return clusters
}



var buildClustersFromDb = function(done) {
	console.log('buildClustersFromDb')

	var matrix = null
	var clusters = null

	async.waterfall([
		function(next) {
			simMatrix.buildMatrixFromDb(next) 
		},
		function(matrixxx, next) {
			matrix = matrixxx
			db.getCentroidRows(next) 
		},
		function(centroidRows, next) {
			
			var clusters = centroidRows.map(function(centroidRow) {
				return new Cluster(matrix, centroidRow)
			})

			function each(clusters, i) {
			
				if(i<clusters.length) {
					db.getClusterMembers(i, function(err, members) {
						if(err) { return done(err) }
						clusters[i].members = members
						each(clusters, ++i)
					})
				} else {
					clusters = new ClusterGroup(clusters)	
					done(null, clusters)	
				}
			}
			each(clusters, 0)
		}
	], done) 
}


//exports.fromDb = fromDb
exports.cluster = cluster
exports.buildClustersFromDb = buildClustersFromDb
