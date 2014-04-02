var txnDb 		= require('../transactions/db')
var seqFind 	= require('../sequences/seq-find')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')


// Decides whether to use levenshtein or cosine
var clusterTxn = function(centroids, txnId, callback) {
	async.waterfall([
		function(next) {
			txnVectorDb.getTxnVector(txnId, next)
		},
		function(vectorValues, next) {

			var params = {
				txnId: txnId,
				centroids: centroids,
			}
			params.vectorValues = vectorValues
			clusterTxnCosine(params, next)
		}
	], callback)
}




var clusterTxnLevenshtein = function(centroids, txnId, callback) {
	async.waterfall([
		function(next) {
			txnDb.getTxn(txnId, next)
		},
		function(txn, next) {
			var allSeqs = seqFind.findSeqs(txn, 1)

			var bestMatch = { 
				centroidId: 0, 
				distance: 100000000 
			}

			centroids.forEach(function(centroid) {
				var distance = centroid.distanceLevenshtein(allSeqs)
				if(distance === 0) {
					console.log('##################################')
					console.log('clusterTxnLevenshtein txnid', txnId, allSeqs)
					console.log('##################################')
				}
				
				if(distance <= bestMatch.distance) {
					bestMatch.distance 		= distance
					bestMatch.centroidId 	= centroid.id
					//console.log('new best centroid', centroid.id)
				}
			})

			//console.log('clusterTxnLevenshtein txnid', txnId, txn, bestMatch)
			centroids[bestMatch.centroidId].txnIds.push(txnId)
			next(null)
		},

	], callback)
}


var clusterTxnCosine = function(params, callback) {
	async.waterfall([
		function(next) {

			var bestMatch = { 
				centroidId: 0, 
				sim: 0 
			}

			params.centroids.forEach(function(centroid) {
				var sim = centroid.simCosine(params.vectorValues)
				if(sim > bestMatch.sim) {
					bestMatch.sim = sim
					bestMatch.centroidId = centroid.id
				}
			})
			//console.log('cluster txnid', txnId, bestMatch)
			params.centroids[bestMatch.centroidId].txnIds.push(params.txnId)
			next(null)
		},

	], callback)
}

exports.clusterTxnLevenshtein = clusterTxnLevenshtein
exports.clusterTxn = clusterTxn
