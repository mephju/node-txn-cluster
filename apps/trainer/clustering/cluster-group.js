
var Cluster 	= require('./cluster').Cluster


/**
 * ClusterGroup represents all clusters within a dataset
 * @param {[type]} clusterArray [description]
 */
var ClusterGroup = function(dataset) {
	this.clusters = []
	this.isIterationNeeded = true
	this.dataset = dataset
}


/**
 * Called during clustering to assign txns to clusters.
 * @param  {[type]} txnRow [description]
 * @return {[type]}        [description]
 */
ClusterGroup.prototype.findBestMatch = function(txnRow) {
	var bestMatch = {
		distance: 1,
		idx: -1
	}

	for (var i=0; i<this.clusters.length; i++) {
		var c = this.clusters[i]
		

		// var distance 	= c.distance(txnRow['item_ids'])	
		var distance 	= c.d(txnRow)


		if(distance < bestMatch.distance) {
			bestMatch.distance	= distance
			bestMatch.cluster 	= c
			bestMatch.id 		= c.centroidRow['txn_id']
			bestMatch.idx 		= i
		}	
	}


	if(bestMatch.idx === -1) return null
	//console.log('findBestMatch', matchIdx)
	return this.clusters[bestMatch.idx]
}


/**
 * Called during construction of transition matrix.
 * Iterates thru all clusters and fist the best match for the given txn.
 * 
 * @param  {[type]} txn [description]
 * @return {[type]}     [description]
 */
ClusterGroup.prototype.findBestMatchSeq = function(txn) {

	var	distance = 1
	var	idx = -1

	for (var i=0; i<this.clusters.length; i++) {
		var c = this.clusters[i]
		
		var d	= c.distance(txn)		

		if(d < distance) {
			distance	= d
			idx 		= i
			if(d < 0.5) {
				return idx
			}
		}	
	};
	return idx
}





/**
 * Resets all clusters to clusters without any members so 
 * a new iteration of assignments can begin.
 * 
 * @return {[type]} [description]
 */
ClusterGroup.prototype.clearMembers = function() {
	this.clusters.forEach(function(cluster) {
		cluster.clearMembers()
	}) 
}

//
//Only keep clusters that have members assigned to them.
//
ClusterGroup.prototype.cleanUp = function() {
	var cleaned = []
	this.clusters.forEach(function(cluster) {
		if(cluster.members.length > this.dataset.config.MIN_CLUSTER_SIZE) {
			cleaned.push(cluster)
		}
	}.bind(this))
	this.clusters = cleaned
}


ClusterGroup.prototype.recomputeCentroids = function() {
	log('recomputeCentroids')
	this.isIterationNeeded = false

	var _this = this

	this.clusters.forEach(function(cluster) {
		var changed = cluster.recomputeCentroid()
		_this.isIterationNeeded = _this.isIterationNeeded || changed
	})
}


ClusterGroup.prototype.addCluster = function(cluster) {
	this.clusters.push(cluster)
}





module.exports = ClusterGroup