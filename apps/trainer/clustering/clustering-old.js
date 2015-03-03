
var Cluster 		= require('./cluster')
var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance



/**
 * Clusters all txnRows via the kmeans algorithm
 * 
 * @param  {[type]}   txnRows [description]
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
exports.cluster = function(dataset, txnRows, done) {

	log('cluster')
	var clusters = init(dataset, txnRows)
	clusterGroup = clusterIterate(txnRows, clusters)
	done(null, clusterGroup)
}



/**
 * Creates clusters by clustering txnRows.
 * 
 * @param  {[type]} txnRows  [description]
 * @param  {[type]} clusters [description]
 * @return {[type]}          [description]
 */
var clusterIterate = function(txnRows, clusters) {
	if(clusters.isIterationNeeded) {
		clusters.clear()
		console.log('clusterIterate ', txnRows.length)
		
		txnRows.forEach(function(txnRow, i) {

			var c = clusters.findBestMatch(txnRow)
			if(c) { 	
				c.addMember(txnRow) 
			} 
		})
		clusters.recomputeCentroids()
		//help.removeNulls(txnRows)
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
var init = function(dataset, txnRows) {
	
	const K = Math.max(
		parseInt(txnRows.length / 750), 
		4
	);

	console.log('clustering.init centroids', K, 'txnRows count', txnRows.length)

	var max 			= txnRows.length - 1
	var centroids 		= []
	var clusters	 	= []
	
	process.stdout.write('-' + K)

	var distanceMeasure = new Distance(dataset)
	
	while(centroids.length < K) {
		process.stdout.write('.')
		var randomIdx = Math.floor(Math.random() * max)
		var centroid = txnRows[randomIdx]
		
		if(centroids.indexOf(centroid) === -1) {
			centroids.push(centroid)
			clusters.push(new Cluster(centroid, distanceMeasure))
		}
	}

	var clusters = new ClusterGroup(clusters)
	return clusters
}



