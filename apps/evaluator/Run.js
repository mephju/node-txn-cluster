var measure 	= require('./measure')


function Run(dataset, recommender, txnRows) {
	if(!recommender) { 
		throw new Error('no recommender supplied ' + recommender + ' for ' + dataset.config.RECOMMENDER)
	}
	// return log.red(dataset.config.RECOMMENDER, recommender)
	this.dataset = dataset
	this.recommender = recommender
	this.txnRows = txnRows
	this.N = this.dataset.config.N
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
		if(i%100 === 0) {
			log.write(i + ' of ' + this.txnRows.length + '.')
		}
		precisionSum += this._evalTxn(this.txnRows[i])
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
	
	var precisionSum = 0
	var runCount = txn.length - this.N
	
	var sessionBegin 	= [] 
	
	for(var i=1; i<=runCount; i++) {

	    sessionBegin.push(txn[i-1])	
		

		var recommendations = this.recommender.recommend(sessionBegin, this.N)
		
		if(recommendations.length > 0) { 
			// var sessionEnd = txn.slice(i, i+this.N)
			// precisionSum += measure.precision(
			// 	sessionEnd, 
			// 	recommendations
			// );
			precisionSum += measure.precision(
				txn,
				i,
				i+this.N, 
				recommendations
			);
		}
	}

	this.recommender.reset()

	var precisionAvg = precisionSum / runCount
	return precisionAvg
}
