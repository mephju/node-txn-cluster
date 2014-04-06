var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var clusterDb	= require('../clustering/cluster-db')

var centroidCollection = require('../clustering/kmeans-centroid-collection')
var CentroidCollection = centroidCollection.CentroidCollection


var buildTransMatrix = function(callback) {
	async.waterfall([
		function(next) {
			centroidCollection.buildFromDb(next)
		},
		function(centroidColl, next) {
			findProbsForBatches(centroidColl, next)
		},
		function(transMatrix, next) {
			db.insertTransMatrix(transMatrix, next)
		}
	], function(err) {
		console.log('finished building transition matrix', err || '')
	})
}




var initTransMatrix = function(size) {
	var row = new Array()
	
	for(var i=0; i<size; i++) { row[i] = 0 }
	
	return row.map(function(entry) {
		return row.slice(0)
	})
}




var findProbsForBatches = function(centroidColl, callback) {
	var transMatrix = initTransMatrix(centroidColl.centroids.length)
	
	txnApp.getTxnBatches(
		function onBatch(txnIdBatch, txnBatch, next) {
			console.log('onBatch', txnBatch.length)
			findProbsPerBatch(
				transMatrix, 
				centroidColl, 
				txnBatch)
			next(null)
		},
		function(err) {
			callback(err, transMatrix)
		}
	);
}


var findProbsPerBatch = function(transMatrix, centroidColl, txnBatch) {
	console.log('findProbsPerBatch')
	txnBatch.forEach(function(txn) {
		findProbsForTxn(transMatrix, centroidColl, txn)
	})
	
}


var findProbsForTxn = function(transMatrix, centroidColl, txn) {
	console.log('findProbsForTxn', txn.length)
	var previousCentroid = centroidColl.findBestMatch(txn.slice(0,1))

	for(var len=2; len<txn.length; len++) {
		var session = txn.slice(0, len)
		var matchedCentroid = centroidColl.findBestMatch(session)
		transMatrix[previousCentroid.id][matchedCentroid.id]++
	}
}

exports.initTransMatrix = initTransMatrix
exports.buildTransMatrix = buildTransMatrix