var config 		= require('../config')
var help 		= require('./help')
var kmCentroid 	= require('./kmeans-centroid')
var kmCentroidCollection 	= require('./kmeans-centroid-collection')
var CentroidCollection 		= kmCentroidCollection.CentroidCollection
var kmTxn 		= require('./kmeans-txn')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')
var txnApp		= require('../transactions/app')
var centroidsOld = null

//
// 1. init centroids
// 2. for each txn
// 		2.1 assign txn to closest centroid
// 3. if assignment took place
// 		3.1 recompute centroids
// 		3.2 repeat from step 2
// 4. done
// 
// 			
const INIT_RANDOM = true

var initCentroids = function(freqSeqs) {
	var vectorSize = freqSeqs.length
	console.log('kmeans.initentroids', vectorSize, config.NUM_CENTROIDS)

	var initRandom = true
	var centroidColl = new CentroidCollection(freqSeqs, INIT_RANDOM)

	centroidsOld = centroidColl
}





var cluster = function(txnIds, callback) {
	var centroidsNew = centroidsOld.copy()

	console.log('kmeans.cluster', txnIds.length, centroidsNew.centroids.length)


	txnApp.getTxnBatches(
		txnIds,
		function onBatch(txnIds, txns, next) {
			console.log('cluster onbatch', txnIds.length)
			kmTxn.clusterTxnLevenshtein2(centroidsNew, txns, txnIds)
			next(null)
		},
		function(err) {
			if(err) {
				callback(err)
			} 
			else if(needsMoreClustering(centroidsOld , centroidsNew)) {
				centroidsOld = centroidsNew
				repeatCluster(txnIds, centroidsOld, callback)
			} 
			else {
				callback(null, centroidsOld)
			}
		}
	);
}





var repeatCluster = function(txnIds, centroids, callback) {
	async.eachSeries(
		centroids,
		function(centroid, next) {
			centroid.recompute(next)
		},
		function(err) {
			cluster(txnIds, callback)	
		}
	);
}





var needsMoreClustering = function(centroidsOld, centroidsNew) {
	var len = centroidsOld.centroids.length
	for(var i=0; i<len; i++) {
		var arr1 = centroidsOld.centroids[i].txnIds
		var arr2 = centroidsNew.centroids[i].txnIds

		//console.log('needs clustering', arr1.length, arr2.length)
		if(!help.arrayEqual(arr1, arr2)) { 
			return true 
		}
	}
	console.log('no more clustering needed')
	return false
}




exports.cluster = cluster
exports.initCentroids = initCentroids