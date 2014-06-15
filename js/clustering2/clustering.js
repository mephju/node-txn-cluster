var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var ClusterGroup = require('./cluster-group').ClusterGroup




var cluster = function(txnRows, done) {

	console.log('cluster init')
	var clusters = init(txnRows)
	console.log('cluster iterate start', clusters)
	clusterGroup = clusterIterate(txnRows, clusters)
	console.log('cluster done')
	done(null, clusterGroup)
}


var clusterIterate = function(txnRows, clusters) {
	if(clusters.isIterationNeeded) {
		clusters.clear()
		console.log('clusterIterate ', txnRows.length)
		
		txnRows.forEach(function(txnRow) {
			var matchedCluster = clusters.findBestMatch(txnRow)
			
			if(!matchedCluster) {
				makeToCluster(txnRow, clusters)
			} else {
				matchedCluster.addMember(txnRow)
			}
		})
		clusters.recomputeCentroids()
		return clusterIterate(txnRows, clusters)
	} else {
		clusters.cleanUp()
		return clusters
	}	
}


var makeToCluster = function(txnRow, clusters) {
	console.log('new cluster for', txnRow['txn_id'], clusters.clusters.length)
	var newCluster = new Cluster(txnRow)
	clusters.clusters.push(newCluster)
}



/**
 * Choose initial centroid randomly
 * @param  {[type]} txnRows [description]
 * @return {[type]}         [description]
 */
var init = function(txnRows) {
	console.log('clustering.init')
	
	var max 			= txnRows.length - 1

	var randomIdx 		= Math.floor(Math.random() * max)
	var centroid 		= txnRows[randomIdx]
	var cluster 		= new Cluster(centroid)
	
	return new ClusterGroup([cluster])
}






//exports.fromDb = fromDb
exports.cluster = cluster

