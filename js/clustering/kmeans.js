var config 		= require('../config')
var help 		= require('./help')
var kmCentroid 	= require('./kmeans-centroid')
var kmLevenshtein = require('./kmeans-lev')
var async 		= require('async')
var txnVectorDb = require('./txn-vector-db')
var centroidsOld = []

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

var initCentroids = function(freqSeqs) {
	var vectorSize = freqSeqs.length
	console.log('kmeans.initentroids', vectorSize, config.NUM_CENTROIDS)
	
	for(var k=0; k<config.NUM_CENTROIDS; k++) {	
		var c = new kmCentroid.Centroid(k, freqSeqs)
		c.init(vectorSize)
		centroidsOld[k] = c
	}
}



var clusterTxnCosine = function(centroids, txnId, callback) {
	async.waterfall([
		function(next) {
			txnVectorDb.getTxnVector(txnId, next)
		},
		function(vectorValues, next) {

			//console.log('clusterTxn', vectorValues)

			var bestMatch = { 
				centroidId: 0, 
				sim:0 
			}

			centroids.forEach(function(centroid) {
				var sim = centroid.simCosine(vectorValues)
				if(sim > bestMatch.sim) {
					bestMatch.sim = sim
					bestMatch.centroidId = centroid.id
				}
			})
		

			//console.log('cluster txnid', txnId, bestMatch)
			centroids[bestMatch.centroidId].txnIds.push(txnId)
			next(null)
		},

	], callback)
}




var clusterCosine = function(txnIds, callback) {
	cluster(
		txnIds, 
		clusterTxnCosine, 
		callback
	);
}

var clusterLevenshtein = function(txnIds, callback) {
	cluster(
		txnIds, 
		kmLevenshtein.clusterTxnLevenshtein, 
		callback
	);
}


var cluster = function(txnIds, clusterTxnFn, callback) {
	var centroidsNew = kmCentroid.copyCentroids(centroidsOld)

	console.log('kmeans.cluster', txnIds.length, centroidsNew.length)

	async.eachSeries(
		txnIds,
		function(txnId, next) {
			clusterTxnFn(centroidsNew, txnId, next)
		},
		function(err) {
			if(err) {
				callback(err)
			} 
			else if(needsMoreClustering(centroidsOld , centroidsNew)) {
				centroidsOld = centroidsNew
				repeatCluster(txnIds, clusterTxnFn, centroidsOld, callback)
			} 
			else {
				callback(null, centroidsOld)
			}
		}
	);
}


var repeatCluster = function(txnIds, clusterTxnFn, centroids, callback) {
	async.eachSeries(
		centroids,
		function(centroid, next) {
			centroid.recompute(next)
		},
		function(err) {
			cluster(txnIds, clusterTxnFn, callback)	
		}
	);
	
}





var needsMoreClustering = function(centroidsOld, centroidsNew) {
	var len = centroidsOld.length
	for(var i=0; i<len; i++) {
		var arr1 = centroidsOld[i].txnIds
		var arr2 = centroidsNew[i].txnIds

		//console.log('needs clustering', arr1.length, arr2.length)
		if(!help.arrayEqual(arr1, arr2)) { 
			return true 
		}
	}
	console.log('no more clustering needed')
	return false
}




exports.clusterCosine = clusterCosine
exports.clusterLevenshtein = clusterLevenshtein
exports.initCentroids = initCentroids