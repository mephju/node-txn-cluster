var txnDb 		= require('../transactions/db')
var seqFind 	= require('../sequences/seq-find')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')






var clusterTxnLevenshtein2 = function(centroidColl, txns, txnIds) {
	for(var i=0; i<txns.length; i++) {
		
		var txn 		= txns[i]
		var txnId 		= txnIds[i]
		var centroid 	= centroidColl.findBestMatch(txn)		

		centroid.txnIds.push(txnId)
		console.log('clustered ', txnId)
	}
	console.log('clusterTxnLevenshtein, finished one batch')
}

var clusterTxnLevenshtein = function(centroidColl, txnId, callback) {
	async.waterfall([
		function(next) {
			txnDb.getTxn(txnId, next)
		},
		function(txn, next) {

			var centroid = centroidColl.findBestMatch(txn)
			centroid.txnIds.push(txnId)

			next(null)
		},

	], callback)
}

exports.clusterTxnLevenshtein2 = clusterTxnLevenshtein2
exports.clusterTxnLevenshtein = clusterTxnLevenshtein

