var txnVector 		= require('./txn-vector')
var txnVectorDb   	= require('./txn-vector-db')
var async 			= require('async')
var kmeans 			= require('./kmeans')
var sequenceDb		= require('../sequences/seq-store')
var dataset 		= require('../dataset-defs').dataset()
var clusterDb		= require('./cluster-db')




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
			console.log('initCentroids')
			kmeans.initCentroids(freqSeqs)
			console.log('cluster')
			cluster(next)
		},
		function(centroids, next){
			console.log('clustering finished', centroids.length)
			clusterDb.insert(centroids, next)
		}
	],
	function(err) {
		console.log('clustering.app.finished', err)
		callback(err)
	}) 
}

var cluster = function(callback) {
	async.waterfall([
		function(next) {
			txnVectorDb.getTxnVectorIds(next)
		},
		function(txnIds, next) {
			kmeans.clusterCosine(txnIds, next)	
		},
		function(centroids, next) {
			txnVectorDb.getNonVectorIds(next);
		},
		function(txnIds, next) {
			console.log('got txnids for clusterLevenshtein', txnIds.length)
			kmeans.clusterLevenshtein(txnIds, next)	
		},
		function(centroids) {
			console.log('clusterLevenshtein finished')
			callback(null, centroids)
		}
	], 
	callback)
}



exports.start = start