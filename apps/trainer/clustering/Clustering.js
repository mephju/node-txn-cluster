
var Cluster 		= require('./cluster')
var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance
var DistanceModel = require('../../distances/DistanceModel') 




function Clustering(dataset, txnRows) {
	this.dataset = dataset
	this.txnRows = txnRows
	this.distanceMeasure = new Distance(dataset)
	this.distanceModel 	= new DistanceModel(dataset)
	this.clusters = new ClusterGroup(dataset)
}

module.exports = Clustering
/**
 * Clusters all txnRows via the kmeans algorithm
 * 
 * @param  {[type]}   txnRows [description]
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
Clustering.prototype.cluster = function(done) {

	if(this.txnRows.length === 0) { return done('cannot cluster 0 txn rows')} 


	log('cluster')
	async.wfall([
		function(next) {	
			//var clusters = init(dataset, txnRows)
			this.clusterIterate(next)
		},
		function(_clusters) {
			done(null, _clusters)
		}
	], this, done)
			
}



/**
 * Creates clusters by clustering txnRows.
 * 
 * @param  {[type]} txnRows  [description]
 * @param  {[type]} clusters [description]
 * @return {[type]}          [description]
 */
Clustering.prototype.clusterIterate = function(done) {
	log('clusterIterate with num txns', this.txnRows.length)
	log.green('clusterIterate isIterationNeeded', this.clusters.isIterationNeeded)
	if(!this.clusters.isIterationNeeded) {
		this.clusters.cleanUp()
		return done(null, this.clusters)
	}


	this.clusters.clearMembers()
	var txnRows = this.txnRows

	// for(var i=0, len=txnRows.length; i<len; i++) {
	// 	process.stdout.write('-')
	// 	var txnRow = txnRows[i]
	// 	var c = this.clusters.findBestMatch(txnRow)
		
	// 	if(c) { 	
	// 		c.addMember(txnRow) 
	// 	} 
	// 	else {
	// 		this.clusters.addCluster(new Cluster(
	// 			txnRow, 
	// 			this.distanceMeasure, 
	// 			this.distanceModel
	// 		));
	// 	}
	// }
	
	async.wfall([
		function(next) {
			async.eachSeries(
				txnRows,
				function(txnRow, next) {
					process.stdout.write('-')
					var c = this.clusters.findBestMatch(txnRow)
					if(c) { 	
						c.addMember(txnRow) 
						return next()
					} 
					var c = new Cluster(
						txnRow, 
						this.distanceMeasure, 
						this.distanceModel
					);
					this.clusters.addCluster(c)
					c.init(next)
				}.bind(this),
				next
			);
		},
		function(next) {
			this.clusters.cleanUp()		
			this.clusters.recomputeCentroids(next)
		},
		function() {
			return this.clusterIterate(done)
		}
	], this, done)
}



// /**
//  * Choose initial centroids randomly
//  * @param  {[type]} txnRows [description]
//  * @return {[type]}         [description]
//  */
// Clustering.prototype.init = function(dataset, txnRows) {
	
// 	const K = dataset.config.CLUSTERS

// 	console.log('clustering.init centroids', K, 'txnRows count', txnRows.length)

// 	var max 			= txnRows.length - 1
// 	var centroids 		= []
// 	var clusters	 	= []
	
// 	process.stdout.write('-' + K)


	
// 	while(centroids.length < K) {
// 		process.stdout.write('.')
// 		var randomIdx = Math.floor(Math.random() * max)
// 		var centroid = txnRows[randomIdx]

// 		if(centroids.indexOf(centroid) === -1) {
// 			centroids.push(centroid)
// 			clusters.push(new Cluster(centroid, this.distanceMeasure, this.distanceModel))
// 		}
// 	}

// 	return clusters
// }



