var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance



function Clustering(dataset) {
	this.dataset = dataset
	this.txnRows = null
	this.distanceMeasure 	= new Distance(dataset)
	this.clusters 			= new ClusterGroup(dataset)

	//During clustering we can improve speed by also providing sorted sets 
	//for jaccard and jaccard levenshtein
	this.distanceMeasure.makeFast(true)
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

	log('cluster')
	async.wfall([
		function(next) {
			this.init(next)
		},
		function(next) {	
			var clusters = this.clusterIterate()
			done(null, clusters)
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





