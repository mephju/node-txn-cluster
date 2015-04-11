var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance
var DistanceModel = require('../../distances/DistanceModel') 




function Clustering(dataset, txnRows) {
	this.dataset = dataset
	this.txnRows = txnRows
	this.distanceMeasure 	= new Distance(dataset)
	this.distanceModel 		= new DistanceModel(dataset)
	this.clusters 			= new ClusterGroup(dataset)
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
			this.init(next)
		},
		function(next) {	
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
	throw new Error('Must be implemented by sub class')
}
Clustering.prototype.init = function(done) { done() }





