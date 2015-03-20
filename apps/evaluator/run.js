var measure 	= require('./measure')

function Run(dataset, recommender, txnRows) {
	this.dataset = dataset
	this.recommender = recommender
	this.txnRows = txnRows
}

exports.Run = Run



/**
 * Calculates avg precision@N for all sessions in txnRows.
 * 
 * @param  {[type]} txnRows        [description]
 * @param  {[type]} theRecommender [description]
 * @return {[type]}                [description]
 */

Run.prototype.start = function() {
	var precisionSum = 0

	for(var i=0; i<this.txnRows.length; i++) {
		precisionSum += this._evalTxn(this.txnRows[i]['item_ids'])
	}

	return precisionSum / this.txnRows.length
}



/**
 * Calculates the txn's average precision@N
 * @param  {[type]} txn [description]
 * @param  {[type]} r   [description]
 * @return {[type]}     [description]
 */
Run.prototype._evalTxn = function(txn) {

	var precisionSum = 0
	var runCount = txn.length - config.N

	for(var i=1; i<=runCount; i++) {

		var sessionBegin 	= txn.slice(0, i)
		var sessionEnd 	 	= txn.slice(i, i+config.N)
		//log('recommender', this.recommender.recommend)
		var recommendations = this.recommender.recommend(sessionBegin, config.N)
		
		precisionSum += measure.precision(
			sessionEnd, 
			recommendations
		);
	}

	this.recommender.reset()

	var precisionAvg = precisionSum / runCount
	process.stdout.write('.')
	//log(precisionSum, runCount, precisionAvg, txn.length)
	//console.log('avg precision for session', prec)
	return precisionAvg
}
