var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup




var cluster = function(txnRows, done) {

	console.log('cluster')
	var clusters = init(txnRows)
	console.log('cluster2')
	clusterGroup = clusterIterate(txnRows, clusters)
	console.log('cluster3')
	done(null, clusterGroup)
}


var clusterIterate = function(txnRows, clusters) {
	if(clusters.isIterationNeeded) {
		clusters.clear()
		console.log('clusterIterate ', txnRows.length)
		txnRows.forEach(function(txnRow, i) {
			process.stdout.write(i + ' ')
			var c = clusters.findBestMatch(txnRow)
			c.addMember(txnRow)

		})
		clusters.recomputeCentroids()
		return clusterIterate(txnRows, clusters)
	} else {
		clusters.cleanUp()
		return clusters
	}	
}



/**
 * Choose initial centroids randomly
 * @param  {[type]} txnRows [description]
 * @return {[type]}         [description]
 */
var init = function(txnRows) {
	
	var K = Math.max(
		config.NUM_CENTROIDS, 
		4
	);

	console.log('clustering.init centroids', K)

	var max 			= txnRows.length - 1
	var centroids 		= []
	var clusters	 	= []

	while(centroids.length < K) {
		process.stdout.write(K + '. ')
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

