var async 			= require('async')
var txnVectorDb 	= require('./txn-vector-db')
var simCosine 		= require('./sim-cosine')
var simLevenshtein 	= require('./sim-levenshtein')



function Centroid(id, freqSeqs) {
	this.id = id
	this.vector = []
	this.txnIds = []
	this.featureVector = freqSeqs 


	this.resetVector = function() {
		for(var i=0; i<this.vector.length; i++) {
			this.vector[i] = 0
		}
	}

	this.computeVector = function(vectorValueCollection) {
		console.log('recompute', this.id)
		//console.log('compute vector', vectorValueCollection)
		this.resetVector()
		var dimensions = {}
		
		var array = []
		vectorValueCollection.forEach(function(vectorValues) {
			vectorValues.forEach(function(vectorEntry) {
				array.push(vectorEntry)
			})
		})

		array.forEach(function(vectorEntry) {
			for(var idx in vectorEntry) {
				dimensions[idx] = dimensions[idx] || 0
				dimensions[idx] += vectorEntry[idx] 
			}
		})

		var numVectors = vectorValueCollection.length
		for(var idx in dimensions) {
			this.vector[idx] = dimensions[idx] / numVectors
		}
	}
}



Centroid.prototype.init = function(vectorSize) {
	for(var i=0; i<this.featureVector.length; i++) {
		this.vector[i] = Math.random()	
	}
	return this
}


Centroid.prototype.recompute = function(callback) {
	console.log('recompute')
	var instance = this
	
	async.waterfall([
		function(next) {
			txnVectorDb.getManyTxnVectors(instance.txnIds, next)
		},
		function(vectorValueCollection, next) {
			//console.log('recompute', vectorValueCollection)
			instance.computeVector(vectorValueCollection);
			callback(null)
		}
	])
}


Centroid.prototype.copy = function() {
	var c = new Centroid(this.id, this.featureVector)
	c.vector = this.vector.slice(0)
	return c
}

Centroid.prototype.simCosine = function(vectorValues) {
	//console.log(this.vector)
	var sim = simCosine.sim(vectorValues, this.vector)
	return sim
}

Centroid.prototype.distanceLevenshtein = function(allSeqs) {
	var distance = 0
	var instance = this

	allSeqs.forEach(function(seq) {

		for(var i=0; i<instance.featureVector.length; i++) {
			var d = simLevenshtein.distanceNorm(
				seq, 
				instance.featureVector[i])
			//console.log('distance', instance.featureVector[i], seq, d, instance.vector[i])
			distance += (d == 0)
				? 1-instance.vector[i] 
				: instance.vector[i] * d
		}		
	})
	return distance
}




var copyCentroids = function(centroids) {
	return centroids.map(function(centroid) {
		return centroid.copy()
	})
}


exports.copyCentroids = copyCentroids,
exports.Centroid = Centroid