var async		= require('async')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')
var recommender = null


/**
 * Calculates avg precision@N for all sessions in txnRows.
 * 
 * @param  {[type]} txnRows        [description]
 * @param  {[type]} theRecommender [description]
 * @return {[type]}                [description]
 */
var evaluate = function(txnRows, theRecommender) {
	var precisionSum = 0

	recommender = theRecommender

	txnRows.forEach(function(txnRow) {
		precisionSum += evalTxn(txnRow['item_ids'])
	})

	return precisionSum / txnRows.length
}



/**
 * Calculates the txn's average precision@N
 * @param  {[type]} txn [description]
 * @param  {[type]} r   [description]
 * @return {[type]}     [description]
 */
var evalTxn = function(txn, r) {

	if(r) {
		recommender = r
	}

	var precisions = []

	for(var i=1, len=txn.length-config.N; i<=len; i++) {

		var sessionBegin 	= txn.slice(0, i)
		var sessionEnd 	 	= txn.slice(i, i+config.N)
		var recommendations = recommender.recommend(sessionBegin, config.N)
		//console.log('recommended output', recommendations)
		//console.log(sessionBegin, sessionEnd, baselineItems)
		
		precisions.push(measure.precision(
			sessionEnd, 
			recommendations
		));
	}

	recommender.reset()

	var precisionSum = 0
	for(var i=0, len=precisions.length; i<len; i++) {
		precisionSum += precisions[i]
	}

	//console.log('avg precision for session', prec)
	return precisionSum / precisions.length
}



exports.evaluate = evaluate
exports.test = {
	evaluate: evaluate,
	evalTxn: evalTxn
}