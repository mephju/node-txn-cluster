

var async		= require('async')
var recommender = require('../recommend/app')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')


var evaluate = function(txnRows, baselineItems) {
	var precisionSumBaseline = 0
	var precisionSumRecommender = 0
	var len = txnRows.length

	txnRows.forEach(function(txnRow) {
		var precision = evalTxn(txnRow['item_ids'], baselineItems)
		precisionSumRecommender += precision.precR		
		precisionSumBaseline += precision.precB
	})

	return {
		precR: precisionSumRecommender / len,
		precB: precisionSumBaseline / len
	}
}


var evalTxn = function(txn, baselineItems) {

	console.log('compare txn with length', txn.length)

	var hitsTxn = []

	for(var i=1, len=txn.length-config.N; i<=len; i++) {
		var sessionBegin 	= txn.slice(0, i)
		var sessionEnd 	 	= txn.slice(i, i+config.N)
		var recommendations = recommender.recommend(sessionBegin, config.N)
		//console.log('recommended output', recommendations)
		hitsTxn.push(measure.getHitsVs(
			sessionEnd, 
			recommendations, 
			baselineItems
		));
	}

	
	var len = hitsTxn.length
	
	hitsTxn = hitsTxn.reduce(function(left, right) {
		right.hitsR += left.hitsR
		right.hitsB += left.hitsB
		return right
	})

	console.log('hitsTxn', hitsTxn)

	

	return {
		precR: hitsTxn.hitsR / len,
		precB: hitsTxn.hitsB / len
	}
}



exports.evaluate = evaluate
exports.test = {
	evalTxn: evalTxn
}