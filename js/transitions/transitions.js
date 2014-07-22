var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var config 		= require('../config')
var eachtick 	= require('eachtick')



var findTransitions = function(clusters, txnRows, done) {
	
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
					manyTransitions.push({ 
						seq:findProbsForTxn(clusters, txn), 
						'txn_id':txnRow['txn_id'] 
					})
				})
			} else {
				manyTransitions.push({ 
					seq:findProbsForTxn(clusters, txn), 
					'txn_id':txnRow['txn_id'] 
				})
			}

			if(manyTransitions.length > 1000 || i == txnRows.length-1) {
				var data = manyTransitions
				manyTransitions = []
				db.insertTransitions(data, next)
			} else {
				next(null)
			}
		},
		function(err, stop) {
			console.log('findTransitions', 'done')
			done(err)
		}
	);
}

const ALWAYS_RETURN_CLUSTER_IDX = true

var findProbsForTxn = function(clusters, txn) {
		
	var previousCentroidId 	= -1
	var transitions 		= [-1]
	
	for(var len=1; len<txn.length; len++) {
		
		var session = txn.slice(0, len)
		var matchedCentroidId = clusters.findBestMatchSeq(session)
		
		transitions.push(matchedCentroidId)
		
		// if(previousCentroidId !== -1 && matchedCentroidId === -1) {
		// 	var prev = clusters.clusters[previousCentroidId].centroidRow['item_ids'].toString()
		// 	console.log(-1, prev, session.toString())
		// }
		previousCentroidId = matchedCentroidId
	}

	return transitions
}


exports.findTransitions = findTransitions