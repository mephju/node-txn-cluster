
var async		= require('async')
var txnDb		= require('../transactions/db')
var recommender = require('../recommend/app')
var baseline 	= require('./most-popular')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')



var allHits = [0, 0]

var baselineItems = null

var precisionSumBaseline = 0
var precisionSumRecommender = 0

var txnCount = 0

var N = 5


var start = function(callback) {
	async.waterfall([
		function(next) {
			baseline.init(next)
		},
		function(next) {
			recommender.init(next)
		},
		function(next) {
			baselineItems = baseline.getPopularItemsForN(N)
			txnDb.getAllTxns(next, true)
		},
		function(txnRows, next) {
			evaluate(txnRows, next)
			console.log('###########################################')
			console.log('compared %d txns from validation set', txnCount)
			
			precB = precisionSumBaseline / txnCount
			precR = precisionSumRecommender / txnCount

			console.log('Recommender Precision', precR)
			console.log('Baseline Precision', precB)
		}
	], 
	function(err) {
		console.log(err) 
		if(callback) { 			
			callback(err) 
		}
	})
}


var evaluate = function(txnRows) {
	txnRows.forEach(function(txnRow) {
		if(evalOneTxn(txnRow['item_ids'])) {
			txnCount++
		}
	})
	console.log('txnCount', txnCount)
	console.log('txnCount txnRows', txnRows.length)
}




var evalOneTxn = function(txn) {
	if(txn.length > N) {
		console.log('compare txn with length', txn.length)
		var runs = 0

		var hitsTxn = {
			recommender:0,
			baseline:0
		}
		for(var i=1, len=txn.length-N; i<len; i++) {
			var hits = evaluateSession(txn, i)	
			hitsTxn.recommender 	+= hits.hitsR
			hitsTxn.baseline 		+= hits.hitsB
			runs++
		}
		
	    precisionSumRecommender 	+= hitsTxn.recommender / runs
	    precisionSumBaseline 		+= hitsTxn.baseline / runs

	    console.log('hits R vs B --- %d vs. %d', allHits[0], allHits[1])
	    return true
	}
	console.log('no eval, txn too short')
	return false	
}


var evaluateSession = function(txn, i) {
	
	var sessionBegin = txn.slice(0, i)
	var sessionEnd 	 = txn.slice(i, i+N)

	var recommendedItems = recommender.recommend(sessionBegin, N)		
	console.log('recommended input:output', recommendedItems)
	var hits = measure.getHitsVs(
		sessionEnd, 
		recommendedItems, 
		baselineItems
	);

	allHits[0] += hits.hitsR // hits by recommender
	allHits[1] += hits.hitsB // hits by baseline

	return hits
}



exports.start = start
start()