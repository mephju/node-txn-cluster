var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var config 		= require('../config')



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
		var txn = txnRow['item_ids']
		
		if(txn.length > 50) {
			var txns = help.toBatches(txn, 50)
			txns.forEach(function(txn) {
				findProbsForTxn(transMatrix, clusters, txn)		
			})
		} else {
			findProbsForTxn(transMatrix, clusters, txn)
		}
		
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



const ALWAYS_RETURN_CLUSTER_IDX = true

var findProbsForTxn = function(transMatrix, clusters, txn) {
	console.log('findProbsForTxn', txn.length)
	
	var previousCentroidId = -1
	
	for(var len=1; len<txn.length; len++) {
		
		var session = txn.slice(0, len)
		var matchedCentroidId = clusters.findBestMatchSeq(session)
		
		//if(len < 10) console.log('length', clusters.clusters.length, 'prev', previousCentroidId, 'match', matchedCentroidId,  session)
		
		if(!(previousCentroidId === -1 || matchedCentroidId === -1)) {
			transMatrix[previousCentroidId][matchedCentroidId]++			
		}
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