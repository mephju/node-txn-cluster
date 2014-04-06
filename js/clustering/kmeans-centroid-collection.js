var config 		= require('../config')
var Centroid 	= require('./kmeans-centroid').Centroid
var clusterDb 	= require('./cluster-db')
var async 		= require('async')
var sequenceDb	= require('../sequences/seq-store')
var seqFind		= require('../sequences/seq-find')




//CentroidCollection(featureVector)
//CentroidCollection(featureVector, centroidRows)
var CentroidCollection = function() {
	
	this.featureVector 	= arguments[0]
	
	if(arguments.length === 2) {
		if(typeof arguments[1] === 'boolean') {
			this._initRandom()
		} else {
			this._initFromCentroidRows(arguments[1])	
		}
	} 
	else {
		this._init()
	}
}


CentroidCollection.prototype._initRandom = function() {
	this.centroids = new Array(config.NUM_CENTROIDS)
	for(var i=0; i<this.centroids.length; i++ ) {
		this.centroids[i] = new Centroid(i, this.featureVector)
		this.centroids[i].init()
	}
}

CentroidCollection.prototype._init = function() {
	this.centroids = []
}

CentroidCollection.prototype._initFromCentroidRows = function(centroidRows) {
	var centroids = []
	var instance = this
	centroidRows.forEach(function(row) {
		var c = new Centroid(row['cluster_id'], instance.featureVector)
		c.vector = JSON.parse(row['vector'])
		centroids.push(c)
	})
	this.centroids = centroids
}



CentroidCollection.prototype.findBestMatch = function(txn) {

	var bestMatch = {
		id:0,
		distance:0,
	}

	this.centroids.forEach(function(centroid) {
		var s = centroid.sim(txn)
		if(s >= bestMatch.distance) {
			bestMatch.id = centroid.id
			bestMatch.distance = s
		}
	})
	//console.log('CentroidCollection.findBestMatch.d', bestMatch.id, bestMatch.distance)

	return this.centroids[bestMatch.id]
}




CentroidCollection.prototype.copy = function() {
	var instance = this
	var newCollection = new CentroidCollection(this.featureVector)
	this.centroids.forEach(function(centroid) {
		newCollection.centroids.push(centroid.copy())
	})
	return newCollection
}




var buildFromDb = function(callback) {
	console.log('centroidCollection.buildFromDb')
	async.waterfall([
		function(next) {
			console.log('getCentroidRows')
			clusterDb.getCentroidRows(next)
		}, 
		function(centroidRows, next) {
			//console.log(centroidRows)
			sequenceDb.getFreqSeqs(function(err, freqSeqs) {
				next(err, centroidRows, freqSeqs)
			})
		},
		function(centroidRows, freqSeqs, next) {
			console.log('centroidCollection.buildFromDb.centroidsRows', centroidRows.length)
			console.log('centroidCollection.buildFromDb.getFreqSeqs', freqSeqs.length)
			var centroidCollection = new CentroidCollection(
				freqSeqs,
				centroidRows
			);
			console.log(
				'centroidCollection.buildFromDb centroids', 
				centroidCollection.centroids.length)
			callback(null, centroidCollection)
		}

	], callback)
}

exports.buildFromDb = buildFromDb
exports.CentroidCollection = CentroidCollection