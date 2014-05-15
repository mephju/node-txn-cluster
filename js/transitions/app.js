var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var clusterDb	= require('../clustering/cluster-db')
var help 		= require('../help')




var buildTransMatrix = function(clusters, callback) {
	async.waterfall([
		function(next) {
			findProbsForBatches(clusters, next)
		},
		function(transMatrix, next) {
			db.insertTransMatrix(transMatrix, next)
		}
	], function(err) {
		console.log('finished building transition matrix', err || '')
		callback(err)
	})
}




var initTransMatrix = function(size) {
	var row = new Array()
	
	for(var i=0; i<size; i++) { row[i] = 0 }
	
	return row.map(function(entry) {
		return row.slice(0)
	})
}




var findProbsForBatches = function(clusters, callback) {
	var transMatrix = initTransMatrix(clusters.clusters.length)
	
	txnApp.getTxnBatches(
		function onBatch(txnIdBatch, txnBatch, next) {
			console.log('onBatch', txnBatch.length)
			findProbsPerBatch(transMatrix, clusters, txnBatch)
			next(null)
		},
		function(err) {
			callback(err, transMatrix)
		}
	);
}


var findProbsPerBatch = function(transMatrix, clusters, txnBatch) {
	console.log('findProbsPerBatch')
	txnBatch.forEach(function(txn) {
		findProbsForTxn(transMatrix, clusters, txn)
	})
	
}


var findProbsForTxn = function(transMatrix, centroidColl, txn) {
	console.log('findProbsForTxn', txn.length)
	var previousCentroid = centroidColl.findBestMatch(txn.slice(0,1))

	var txns = txn.length > 20 
		? help.toBatches(txn, 20) 
		: [txn]

	txns.forEach(function(tx) {
		for(var len=2; len<tx.length; len++) {
			var session = tx.slice(0, len)
			var matchedCentroid = centroidColl.findBestMatch(session)
			transMatrix[previousCentroid.id][matchedCentroid.id]++
			previousCentroid = matchedCentroid
		}
	})
		
}

exports.initTransMatrix = initTransMatrix
exports.buildTransMatrix = buildTransMatrix




var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}