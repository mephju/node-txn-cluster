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

			var centroid = centroidColl.findBestMatch(txn)
			centroid.txnIds.push(txnId)

			next(null)
		},

	], callback)
}


exports.clusterTxnLevenshtein = clusterTxnLevenshtein

