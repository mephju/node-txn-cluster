var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup
var help 		= require('../help')



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

			var c = clusters.findBestMatch(txnRow)
			if(c) { 	
				c.addMember(txnRow) 
			} 
			// else {		
			// 	txnRows[i] = null
			// }

		})
		clusters.recomputeCentroids()
		help.removeNulls(txnRows)
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
	process.stdout.write('' + K)
	while(centroids.length < K) {
		process.stdout.write('.')
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

