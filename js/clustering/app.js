var txnVector 		= require('./txn-vector')
var txnVectorDb		= require('./txn-vector-db')
var txnDb			= require('../transactions/db')
var async 			= require('async')
var kmeans 			= require('./kmeans')
var kmTxn 			= require('./kmeans-txn')
var sequenceDb		= require('../sequences/seq-store')
var dataset 		= require('../dataset-defs').dataset()
var clusterDb		= require('./cluster-db')


var lg = function() {
	console.log('clustering/app.js', arguments)
}




var start = function(callback) {

	async.waterfall([
		function(next) {
			txnVector.buildVectors(next)
		},
		function(next) {
			console.log('getFreqSeqs')
			sequenceDb.getFreqSeqs(next)
		},
		function(freqSeqs, next) {
			console.log('initCentroids with freqSeqs' , freqSeqs.length)
			kmeans.initCentroids(freqSeqs)
			console.log('cluster')
			cluster(next)
		},
		function(centroidColl, next){
			console.log('clustering finished', centroidColl.centroids.length)
			clusterDb.insert(centroidColl, next)
		}
	],
	function(err) {
		console.log('clustering.app.finished', err)
		callback(err)
	}) 
}

// var cluster = function(callback) {
// 	async.waterfall([
// 		function(next) {
// 			txnDb.getAllTxnIds(next)
// 		}
// 		function(txnIds, next) {
// 			lg('kmeans.cluster')
// 			kmeans.cluster(txnIds, next)	
// 		},
// 		function(centroidColl, next) {
// 			console.log('clusterLevenshtein finished')
// 			callback(null, centroidColl)
// 		}
// 	], 
// 	callback)
// }



var assignTxnsToCentroids = function(txnIds, centroidColl, callback) {
	async.eachSeries(
		txnIds,
		function(txnId, next) {
			console.log('start Levenshtein clustering')
			kmTxn.clusterTxnLevenshtein(centroidColl, txnId, next)
		},
		function(err) {
			callback(err, centroidColl)
		}
	);
}



exports.start = start



var cluster = function(callback) {
	async.waterfall([
		function(next) {
			lg('getTxnVectorIds')
			txnVectorDb.getTxnVectorIds(next)
		},
		function(txnIds, next) {
			lg('kmeans.cluster')
			kmeans.cluster(txnIds, next)	
		},
		function(centroidColl, next) {
			lg('getNonVectorIds')
			txnVectorDb.getNonVectorIds(function(err, txnIds) {
				next(err, centroidColl, txnIds)
			}) 
		},
		function(centroidColl, txnIds, next) {
			assignTxnsToCentroids(txnIds, centroidColl, next)
		},
		function(centroidColl) {
			console.log('clusterLevenshtein finished')
			callback(null, centroidColl)
		}
	], 
	callback)
}


var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}


