var async		= require('async')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')
var recommender = null


var evaluate = function(txnRows, theRecommender) {
	var precisionSumRecommender = 0
	var len = txnRows.length

	recommender = theRecommender

	txnRows.forEach(function(txnRow) {
		var precision = evalTxn(txnRow['item_ids'])
		precisionSumRecommender += precision
	})

	return precisionSumRecommender / len
}



var evalTxn = function(txn, r) {

	if(r) {
		recommender = r
	}

	var hitsTxn = []

	for(var i=1, len=txn.length-config.N; i<=len; i++) {
		var sessionBegin 	= txn.slice(0, i)
		var sessionEnd 	 	= txn.slice(i, i+config.N)
		var recommendations = recommender.recommend(sessionBegin, config.N)
		//console.log('recommended output', recommendations)
		//console.log(sessionBegin, sessionEnd, baselineItems)
		//console.log(hitsTxn)
		hitsTxn.push(measure.getHitsVs(
			sessionEnd, 
			recommendations
		));
	}

	recommender.reset()

	
	var len = hitsTxn.length
	
	var prec = hitsTxn.reduce(function(left, right) {
		return right + left
	}) / len

	console.log('avg precision', prec)
	return prec
}



exports.evaluate = evaluate
exports.test = {
	evaluate: evaluate,
	evalTxn: evalTxn
}