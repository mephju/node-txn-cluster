var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup


var cluster = function(txnRows, matrix, done) {

	console.log('cluster')
	var clusters = init(txnRows, matrix)
	
	clusterIterate(txnRows, clusters)
	done(null, clusters)
}


var clusterIterate = function(txnRows, clusters) {
	if(clusters.isIterationNeeded) {
		clusters.clear()
		console.log('clusterIterate ', txnRows.length)
		txnRows.forEach(function(txnRow) {
			clusters.assign(txnRow)
		})
		clusters.recomputeCentroids()
		clusterIterate(txnRows, clusters)
	} 		
}



var init = function(txnRows, matrix) {
	var K 		= config.NUM_CENTROIDS
	var max 	= txnRows.length - 1

	var centroids 		= []
	var clusters	 	= []

	while(centroids.length < K) {
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



exports.fromDb = fromDb
exports.cluster = cluster
