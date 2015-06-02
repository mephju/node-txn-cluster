
var Clustering 		= require('./Clustering')
var Cluster 		= require('./cluster')


function ClusteringFixed(dataset, txnRows) {
	log.blue('ClusteringFixed')
	Clustering.call(this, dataset, txnRows)
}

ClusteringFixed.prototype = Object.create(Clustering.prototype, {
	constructor: ClusteringFixed
})

module.exports = ClusteringFixed

/**
 * Choose initial centroids randomly
 * @param  {[type]} txnRows [description]
 * @return {[type]}         [description]
 */
Clustering.prototype.init = function(done) {
	
	var txnModel = new app.models.TxnModel(this.dataset)
	async.wfall([
		function(next) {
			txnModel.txnsForTraining(next)
		},
		function(txnRows, next) {
			if(txnRows.length === 0) { return done('cannot cluster 0 txn rows')}

			this.txnRows = txnRows
			this._init(done)
		},
		done
	], this)
}

Clustering.prototype._init = function(done) {
	const K = parseInt(Math.pow(
		this.txnRows.length, 
		0.6195
	));
	var txnRows = this.txnRows

	console.log('clustering.init centroids', K, 'txnRows count', txnRows.length)
	
	var centroids 		= []
	var clusters	 	= this.clusters
	
	
	process.stdout.write('i' + K)

	var self = this

	async.whilst(
	    function() { 
	    	return centroids.length < K 
	    },
	    function(next) {
	    	
			var centroid = self._chooseValidCentroid()

			if(centroids.indexOf(centroid) !== -1) {
				return next()
			}

			centroids.push(centroid)
			clusters.addCluster(new Cluster(
				centroid, 
				self.distanceMeasure
			));

			log.green('centroids sofar', centroids.length)
			
			next()
	    },
	    done
	);
}

/**
 * Finds an inital centroid that actually could have members. Meaning it's centroid is 
 * somewhat similar to other txnRows.
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
ClusteringFixed.prototype._chooseValidCentroid = function(done) {
	log('_chooseValidCentroid', this.txnRows.length)

	var txnRows 	= this.txnRows
	var max 		= txnRows.length - 1
	var isValid 	= false
	var randomIdx 	= -1
	
	while(!isValid) {
		log.write('x')
		randomIdx 	= Math.floor(Math.random() * max)
		isValid 	= this._isValidCentroid(randomIdx)
	}
	
	return this.txnRows[randomIdx]
}

ClusteringFixed.prototype._isValidCentroid = function(randomIdx) {

	var centroid = this.txnRows[randomIdx]

	for(var i=0; i<this.txnRows.length; i++) {
		
		if(i === randomIdx) continue
		var d = this.distanceMeasure.distance(
			centroid['item_ids'],
			this.txnRows[i]['item_ids']
		);
		if(d < 1) {
			return true
		}
	}
	return false
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

	for(var i=0, len=txnRows.length; i<len; i++) {
		process.stdout.write('-')
		var txnRow = txnRows[i]
		var c = this.clusters.findBestMatch(txnRow)
		
		if(c) { 	
			c.addMember(txnRow) 
		} 
	}
	
	async.wfall([
		function(next) {
			this.clusters.cleanUp()		
			this.clusters.recomputeCentroids(next)
		},
		function() {
			return this.clusterIterate(done)
		}
	], this, done)
}







