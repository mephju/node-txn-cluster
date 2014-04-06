var txnDb 		= require('../transactions/db')
var seqFind 	= require('../sequences/seq-find')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')






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


}

exports.clusterTxnLevenshtein = clusterTxnLevenshtein
exports.clusterTxn = clusterTxn
