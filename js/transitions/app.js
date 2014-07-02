var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var config 		= require('../config')
var eachtick 	= require('eachtick')


var buildTransMatrix = function(clusters, callback) {
	async.waterfall([
		function(next) {
			db.init(next)
		},
		function(next) {
			txnDb.getClusteredTxns(next)
		},
		function(txnRows, next) {
			console.log('getClusteredTxns', txnRows.length, JSON.stringify(txnRows[0]))
			findTransitions(clusters, txnRows, next)
		},
		function(transMatrix, next) {
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
	console.log('findTransitions for txns', txnRows.length)
	
	var manyTransitions = []


	eachtick(
		txnRows,
		function(i, txnRow, next) {
			process.stdout.write('.')
			var txn = txnRow['item_ids']

			
			if(txn.length > 50) {
				var txns = help.toBatches(txn, 50)
				txns.forEach(function(txn) {
					var tsns = findProbsForTxn(transMatrix, clusters, txn)
					manyTransitions.push(tsns)
				})
			} else {
				var tsns = findProbsForTxn(transMatrix, clusters, txn)
				manyTransitions.push(tsns)
			}

			if(manyTransitions.length > 100 || i == txnRows.length-1) {
				var data = manyTransitions
				manyTransitions = []
				db.insertTransitions(data, next)
			} else {
				next(null)
			}
		},
		function(err, stop) {
			console.log('findTransitions', 'done')
			done(err, transMatrix)
		}
	);
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
		
	var previousCentroidId = -1
	var transitions = []
	
	for(var len=1; len<txn.length; len++) {
		
		var session = txn.slice(0, len)
		var matchedCentroidId = clusters.findBestMatchSeq(session)
		
		transitions.push(matchedCentroidId)
		
		if(previousCentroidId !== -1 && matchedCentroidId === -1) {
			var prev = clusters.clusters[previousCentroidId].centroidRow['item_ids'].toString()
			console.log(-1, prev, session.toString())
		}

		if(!(previousCentroidId === -1 || matchedCentroidId === -1)) {
			transMatrix[previousCentroidId][matchedCentroidId]++			
		}
		previousCentroidId = matchedCentroidId
	}

	return transitions
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