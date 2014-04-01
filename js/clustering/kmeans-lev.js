var txnDb = require('../transactions/db')
var seqFind = require('../sequences/seq-find')
var async = require('async')

var clusterTxnLevenshtein = function(centroids, txnId, callback) {
	async.waterfall([
		function(next) {
			txnDb.getTxn(txnId, next)
		},
		function(txn, next) {
			console.log('clusterTxnLevenshtein', txn)
			var allSeqs = seqFind.findSeqs(txn)

			var bestMatch = { 
				centroidId: 0, 
				distance:0 
			}

			centroids.forEach(function(centroid) {
				var distance = centroid.distanceLevenshtein(allSeqs)
				if(distance < bestMatch.distance) {
					bestMatch.distance = distance
					bestMatch.centroidId = centroid.id
				}
			})
		

			//console.log('cluster txnid', txnId, bestMatch)
			centroids[bestMatch.centroidId].txnIds.push(txnId)
			next(null)
		},

	], callback)
}

exports.clusterTxnLevenshtein = clusterTxnLevenshtein