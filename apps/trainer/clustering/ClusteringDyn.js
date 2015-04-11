var Clustering 		= require('./Clustering')
var Cluster 		= require('./cluster')
var ClusterGroup 	= require('./cluster-group')
var Distance 		= require('../similarity').Distance
var DistanceModel = require('../../distances/DistanceModel') 



/**
 * Overwrites Clustering.js
 * @param {[type]} dataset [description]
 * @param {[type]} txnRows [description]
 */
function ClusteringDyn(dataset, txnRows) {
	Clustering.call(this, dataset, txnRows)
}

ClusteringDyn.prototype = Object.create(Clustering.prototype, {
	constructor: ClusteringDyn
})

module.exports = ClusteringDyn






/**
 * Creates clusters by clustering txnRows.
 * 
 * @param  {[type]} txnRows  [description]
 * @param  {[type]} clusters [description]
 * @return {[type]}          [description]
 */
ClusteringDyn.prototype.clusterIterate = function(done) {
	log('clusterIterate with num txns', this.txnRows.length)
	log.green('clusterIterate isIterationNeeded', this.clusters.isIterationNeeded)
	if(!this.clusters.isIterationNeeded) {
		this.clusters.cleanUp()
		return done(null, this.clusters)
	}


	this.clusters.clearMembers()
	var txnRows = this.txnRows

	var assignToClusters = function(next) {
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
	}
	
	async.wfall([
		assignToClusters,
		function(next) {
			this.clusters.cleanUp()		
			this.clusters.recomputeCentroids(next)
		},
		function() {
			return this.clusterIterate(done)
		}
	], this, done)
}





