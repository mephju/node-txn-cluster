
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
			this._init()
			done()
		},
		done
	], this)
}

Clustering.prototype._init = function() {
	const K = parseInt(Math.pow(
		this.txnRows.length,
		0.6195//0.5//0.6195
	));

	console.log('clustering.init centroids', K, 'txnRows count', this.txnRows.length)

	var centroids 		= []

	process.stdout.write('i' + K)

  while(centroids.length < K ) {

		var centroid = this._chooseValidCentroid()

		if(centroids.indexOf(centroid) === -1) {
			centroids.push(centroid)
			this.clusters.addCluster(new Cluster(
				centroid,
				this.distanceMeasure
			));

			log.green('centroids sofar', centroids.length)
		}
  }
}

/**
 * Finds an inital centroid that actually could have members. Meaning it's centroid is
 * somewhat similar to other txnRows.
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
ClusteringFixed.prototype._chooseValidCentroid = function() {
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
		if(d < 1) { return true }
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
Clustering.prototype.clusterIterate = function() {
	log('clusterIterate with num txns', this.txnRows.length)
	log.green('clusterIterate isIterationNeeded', this.clusters.isIterationNeeded)

	var txnRows = this.txnRows

	for(var i=0, len=txnRows.length; i<len; i++) {

		var txnRow = txnRows[i]
		var c = this.clusters.findBestMatch(txnRow)

		if(c) { c.addMember(txnRow) }
		if(!(i % 100)) log.write('-')

	}

	this.clusters.recomputeCentroids()

	if(this.clusters.isIterationNeeded) {
		this.clusters.clearMembers()
		return this.clusterIterate()
	}
	this.clusters.cleanUp()
	return this.clusters
}
