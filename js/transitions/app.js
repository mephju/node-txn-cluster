var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var clusterDb	= require('../clustering/cluster-db')
var help 		= require('../help')




var buildTransMatrix = function(clusters, callback) {
	async.waterfall([
		function(next) {
			txnDb.getAllTxns(next)
		},
		function(txnRows, next) {
			var transMatrix = findTransitions(clusters, txnRows, next)
			db.removeNoTransClusters(transMatrix, next)
		},
		function(transMatrix, next) {
			//console.log(transMatrix)
			db.insertTransMatrix(transMatrix, next)
			
		}
	], function(err) {
		console.log('finished building transition matrix', err || '')
		callback(err)
	})
}


var findTransitions = function(clusters, txnRows, done) {
	var transMatrix = initTransMatrix(clusters.clusters.length)
	txnRows.forEach(function(txnRow) {
		findProbsForTxn(transMatrix, clusters, txnRow)
	})
	return transMatrix
}




var initTransMatrix = function(size) {
	var row = new Array()
	
	for(var i=0; i<size; i++) { row[i] = 0 }
	
	return row.map(function(entry) {
		return row.slice(0)
	})
}




var findProbsForTxn = function(transMatrix, clusters, txnRow) {
	var txn = txnRow['item_ids']
	console.log('findProbsForTxn', txn.length)
	var previousCentroidId = clusters.findBestMatchSeq(txn.slice(0,1))
	
	for(var len=2; len<txn.length; len++) {
		var session = txn.slice(0, len)
		var matchedCentroidId = clusters.findBestMatchSeq(session)
		transMatrix[previousCentroidId][matchedCentroidId]++
		previousCentroidId = matchedCentroidId
	}
		
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