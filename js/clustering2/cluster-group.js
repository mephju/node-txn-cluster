var config 		= require('../config')
var async 		= require('async')
var Cluster 	= require('./cluster').Cluster
var db 			= require('./db')



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
	cluster.addMember(txnRow)	
	return cluster
}



ClusterGroup.prototype.findBestMatch = function(txnRow) {
	var matchedClusterId = this.findBestMatchSeq(txnRow['item_ids'])
	return this.clusters[matchedClusterId]
}

ClusterGroup.prototype.findBestMatchSeq = function(txn) {
	var bestMatch = {
		sim: 0,
		id:0,
		cluster:this.clusters[0],
		lenDiff:999999,
		lenDiffIndex:0
	}

	for (var i=1; i<this.clusters.length; i++) {
		var c = this.clusters[i]

		// var lenDiff = Math.abs(
		// 	c.centroidRow['item_ids'].length - txn.length
		// );
		//
		// if(lenDiff < bestMatch.lenDiff) {
		// 	bestMatch.lenDiff = lenDiff
		// 	bestMatch.lenDiffIndex = i
		// }
		
		var sim = c.simSeq(txn)
		if(sim > bestMatch.sim) {
			bestMatch.sim = sim
			bestMatch.cluster = c
			bestMatch.id = i
		}	
	};

	// if(bestMatch.sim === 0) {
	// 	return bestMatch.lenDiffIndex
	// }
	return bestMatch.id
}




ClusterGroup.prototype.clear = function() {
	this.clusters.forEach(function(cluster) {
		cluster.clear()
	}) 
}

//
//Only keep clusters that have members assigned to them.
//
ClusterGroup.prototype.cleanUp = function() {
	var cleaned = []
	this.clusters.forEach(function(cluster) {
		if(cluster.members.length > 0) {
			cleaned.push(cluster)
		}
	})
	this.clusters = cleaned
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


var buildFromDb = function(done) {
	console.log('buildClustersFromDb')

	var clusters = null

	async.waterfall([

		function(next) {
			db.getCentroidRows(next) 
		},
		function(centroidRows) {
			
			var clusters = centroidRows.map(function(centroidRow) {
				return new Cluster(centroidRow)
			})
			
			async.eachSeries(
				clusters,
				function(cluster, next) {
					var clusterId = cluster.centroidRow['cluster_id']
					db.getClusterMembers(clusterId, function(err, members) {
						cluster.members = members
						next(err, null)
					})	
				},
				function(err) {
					clusters = new ClusterGroup(clusters)		
					done(err, clusters)	
				}
			);
		
		}
	], done) 
}

exports.buildFromDb = buildFromDb