var config 		= require('../config')
var async 		= require('async')
var cluster 	= require('./cluster')

var ClusterGroup = function(clusterArray) {
	this.clusters = clusterArray
	this.isIterationNeeded = true
}

//Assign txn to the closest cluster
//txnRow = {
//	txn_id:"1232123",
//	item_ids:[1,2,3]
//}
ClusterGroup.prototype.assign = function(txnRow) {
	var cluster = this.findBestMatch(txnRow)	
	
	if(cluster.centroidRow['txn_id'] !== txnRow['txn_id']) {
		//txnRow is not the centroid, so we assign it to the cluster
		cluster.addMember(txnRow)	
	}
	return cluster
}

Cluster.prototype.findBestMatch = function(txnRow) {
	var bestMatch = {
		sim: 0,
		cluster:this.clusters[0]
	}

	for (var i=0; i<this.clusters.length; i++) {
		var c = this.clusters[i]
		 else {
			var sim = c.sim(txnRow)
			if(sim > bestMatch.sim) {
				bestMatch.sim = sim
				bestMatch.cluster = c
			}
		}
	};
	return bestMatch.cluster
}



ClusterGroup.prototype.clear = function() {
	this.clusters.forEach(function(cluster) {
		cluster.clear()
	}) 
}


ClusterGroup.prototype.recomputeCentroids = function() {
	var isIterationNeeded = false
	this.clusters.forEach(function(cluster) {
		var changed = cluster.recomputeCentroid()
		if(changed) {
			isIterationNeeded = true
		}
	})
	this.isIterationNeeded = isIterationNeeded
	return isIterationNeeded
}

exports.ClusterGroup = ClusterGroup