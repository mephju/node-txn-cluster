var measure 	= require('./measure')


function Run(dataset, recommender, txnRows) {
	if(!recommender) { throw new Error('no recommender supplied ' + recommender)}
	// return log.red(dataset.config.RECOMMENDER, recommender)
	this.dataset = dataset
	this.recommender = recommender
	this.txnRows = txnRows
}

module.exports = Run



/**
 * Calculates avg precision@N for all sessions in txnRows.
 * 
 * @param  {[type]} txnRows        [description]
 * @param  {[type]} theRecommender [description]
 * @return {[type]}                [description]
 */

Run.prototype.start = function() {
	log.blue('Run.start')
	var precisionSum = 0

	for(var i=0; i<this.txnRows.length; i++) {
		if(i%1 === 0) {
			//log.write('.' + this.dataset.config.CROSS_VALIDATION_RUN + this.dataset.config.MARKOV_ORDER)
			log.write('.')
		}
		precisionSum += this._evalTxn(this.txnRows[i]['item_ids'])
		//log.write(precisionSum/(i+1) + '')
	}
	log.blue('run finished')

	return precisionSum / this.txnRows.length
}


/**
 * Calculates the txn's average precision@N
 * @param  {[type]} txn [description]
 * @param  {[type]} r   [description]
 * @return {[type]}     [description]
 */
Run.prototype._evalTxn = function(txn) {
	var config = this.dataset.config
	var precisionSum = 0
	var runCount = txn.length - config.N
	
	var sessionBegin 	= [] //txn.slice(0, i)
	
	for(var i=1; i<=runCount; i++) {

	    sessionBegin.push(txn[i-1])	
		var sessionEnd 	 	= txn.slice(i, i+config.N)

		var recommendations = this.recommender.recommend(sessionBegin, config.N)
		//log(sessionBegin.slice(-5), recommendations)
		if(recommendations.length > 0) { 
			precisionSum += measure.precision(
				sessionEnd, 
				recommendations
			);
		}
	}

	this.recommender.reset()

	var precisionAvg = precisionSum / runCount
	return precisionAvg
}
