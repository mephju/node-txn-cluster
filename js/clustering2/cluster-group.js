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
// ClusterGroup.prototype.assign = function(clusterIdx, txnRow) {
// 	this.clusters[clusterIdx].addMember(txnRow)	
// 	return cluster
// }



/**
 * Called during clustering to assign txns to clusters.
 * @param  {[type]} txnRow [description]
 * @return {[type]}        [description]
 */
ClusterGroup.prototype.findBestMatch = function(txnRow) {
	var matchIdx = this.findBestMatchSeq(txnRow['item_ids'])
	if(matchIdx === -1) return null
	//console.log('findBestMatch', matchIdx)
	var c = this.clusters[matchIdx]
	return c
}


/**
 * Called during construction of transition matrix.
 * @param  {[type]} txn [description]
 * @return {[type]}     [description]
 */
ClusterGroup.prototype.findBestMatchSeq = function(txn) {

	var bestMatch = {
		distance: 1,
		idx: -1
	}

	for (var i=0; i<this.clusters.length; i++) {
		var c = this.clusters[i]
		
		var distance 	= c.distance(txn)		

		if(distance < bestMatch.distance) {
			bestMatch.distance	= distance
			bestMatch.cluster 	= c
			bestMatch.id 		= c.centroidRow['txn_id']
			bestMatch.idx 		= i
			continue;
		}	
	};


	return bestMatch.idx
}






ClusterGroup.prototype.clear = function() {
	this.clusters.forEach(function(cluster) {
		cluster.members = []
	}) 
}

//
//Only keep clusters that have members assigned to them.
//
ClusterGroup.prototype.cleanUp = function() {
	var cleaned = []
	this.clusters.forEach(function(cluster) {
		if(cluster.members.length > 4) {
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




var buildFromDb = function(done) {
	console.log('buildClustersFromDb')

	var clusters = null

	async.waterfall([

		function(next) {
			db.getCentroidRows(next) 
		},
		function(centroidRows) {
			console.log('buildClustersFromDb', centroidRows.length)			
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
exports.ClusterGroup = ClusterGroup
exports.buildFromDb = buildFromDb