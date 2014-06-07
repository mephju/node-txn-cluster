var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup




var cluster = function(txnRows, done) {

	console.log('cluster')
	var clusters = init(txnRows)
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
		clusters.cleanUp()
		return clusters
	}	
}



var init = function(txnRows) {
	console.log('clustering.init')
	var K = Math.max(
		config.NUM_CENTROIDS, 
		4
	);
	var max 			= txnRows.length - 1
	var centroids 		= []
	var clusters	 	= []

	while(centroids.length < K) {
		console.log('rand K', K)


		var randomIdx = Math.floor(Math.random() * max)
		var centroid = txnRows[randomIdx]
		
		if(centroids.indexOf(centroid) === -1) {
			centroids.push(centroid)
			clusters.push(new Cluster(centroid))
		}
	}

	var clusters = new ClusterGroup(clusters)
	return clusters
}






//exports.fromDb = fromDb
exports.cluster = cluster

