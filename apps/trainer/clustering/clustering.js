
var Cluster 		= require('./cluster')
var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance
var DistanceModel = require('../../distances/distance-model') 


/**
 * Clusters all txnRows via the kmeans algorithm
 * 
 * @param  {[type]}   txnRows [description]
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
exports.cluster = function(dataset, txnRows, done) {

	var bag = {}

	if(txnRows.length === 0) { return done('cannot cluster 0 txn rows')} 


	log('cluster')
	async.waterfall([
		function(next) {	
			var clusters = init(dataset, txnRows)
			clusterIterate(txnRows, clusters, next)
		},
		function(_clusters) {
			done(null, _clusters)
		}
	], done)
			
}



/**
 * Creates clusters by clustering txnRows.
 * 
 * @param  {[type]} txnRows  [description]
 * @param  {[type]} clusters [description]
 * @return {[type]}          [description]
 */
var clusterIterate = function(txnRows, clusters, done) {
	console.log('clusterIterate ', txnRows.length)

	if(!clusters.isIterationNeeded) {
		clusters.cleanUp()
		return done(null, clusters)
	}


	clusters.clear()
	
	for(var i=0, len=txnRows.length; i<len; i++) {
		var c = clusters.findBestMatch(txnRows[i])
		if(c) { 	
			c.addMember(txnRows[i]) 
		}
	}
	
	async.waterfall([
		function(next) {		
			clusters.recomputeCentroids(next)
		},
		function() {
			return clusterIterate(txnRows, clusters, done)
		}
	], done)
}



/**
 * Choose initial centroids randomly
 * @param  {[type]} txnRows [description]
 * @return {[type]}         [description]
 */
var init = function(dataset, txnRows) {
	
	const K = dataset.config.CLUSTERS

	console.log('clustering.init centroids', K, 'txnRows count', txnRows.length)

	var max 			= txnRows.length - 1
	var centroids 		= []
	var clusters	 	= []
	
	process.stdout.write('-' + K)

	var distanceMeasure = new Distance(dataset)
	var distanceModel 	= new DistanceModel(dataset)
	
	while(centroids.length < K) {
		process.stdout.write('.')
		var randomIdx = Math.floor(Math.random() * max)
		var centroid = txnRows[randomIdx]

		if(centroids.indexOf(centroid) === -1) {
			centroids.push(centroid)
			clusters.push(new Cluster(centroid, distanceMeasure, distanceModel))
		}
	}

	var clusters = new ClusterGroup(clusters, dataset)
	return clusters
}



