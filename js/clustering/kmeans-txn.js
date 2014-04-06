var txnDb 		= require('../transactions/db')
var seqFind 	= require('../sequences/seq-find')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')


var clusterTxn = function(centroidColl, txnId, callback) {
	async.waterfall([
		function(next) {
			txnVectorDb.getTxnVector(txnId, next)
		},
		function(vectorValues, next) {

			var params = {
				txnId: txnId,
				centroidColl: centroidColl,
			}
			params.vectorValues = vectorValues
			clusterTxnCosine(params, next)
		}
	], callback)
}




var clusterTxnLevenshtein = function(centroidColl, txnId, callback) {
	async.waterfall([
		function(next) {
			txnDb.getTxn(txnId, next)
		},
		function(txn, next) {

			var bestMatch = { 
				centroidId: 0, 
				sim: 100000000 
			}

			centroidColl.centroids.forEach(function(centroid) {
				var sim = centroid.sim(txn)
				
				if(sim >= bestMatch.sim) {
					bestMatch.sim 			= sim
					bestMatch.centroidId 	= centroid.id
					//console.log('new best centroid', centroid.id)
				}
			})
			centroidColl.centroids[bestMatch.centroidId].txnIds.push(txnId)
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

			params.centroidColl.centroids.forEach(function(centroid) {
				var sim = centroid.simCosine(params.vectorValues)
				if(sim > bestMatch.sim) {
					bestMatch.sim = sim
					bestMatch.centroidId = centroid.id
				}
			})
			//console.log('cluster txnid', txnId, bestMatch)
			params.centroidColl.centroids[bestMatch.centroidId].txnIds.push(params.txnId)
			next(null)
		},

	], callback)
}

exports.clusterTxnLevenshtein = clusterTxnLevenshtein
exports.clusterTxn = clusterTxn
