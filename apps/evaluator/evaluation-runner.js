require('../init')
var Run 			= require('./Run')
var TxnModel 		= app.models.TxnModel
var recommenders 	= require('../recommenders')

process.on('message', function(data) {
	log('CHILD got message', data)	
	evaluate(data)	
})


var evaluate = function(data) {
	
	var dataset = app.datasets.Dataset.rebuild(data)
	
	var recommender = null

	async.waterfall([
		function(next) {
			getRecommender(dataset, next)
		},
		function(_recommender, next) {
			recommender = _recommender
			new TxnModel(dataset).txnsForValidation(next)					
		},
		function(txnRows, next) {
			//We are only interested in txns having a length greater than N+1
			log.blue('got txnrows1', txnRows.length)
			txnRows.forEach(function(txnRow, i) {
				txnRows[i] = _.unique(txnRow['item_ids'])
			})
			log.blue('got txnrows2', txnRows.length)
			txnRows = txnRows.filter(function(txn) {
				return txn.length > dataset.config.N
			})
			log.blue('got txnrows3', txnRows.length)

			// log.blue('recommender is', recommender)
			var evalRun = new Run(dataset, recommender, txnRows)
			var precision = evalRun.start()
			log.green('finished evaluation run for', dataset.name)
			process.send({precision: precision})
		}
	], 
	function(err) {
		throw new Error('child got an error: ' + err)
	})
}



var getRecommender = function(dataset, done) {
	log.blue('getRecommender', dataset.config.RECOMMENDER)
	var recommender = null

	async.waterfall([
		function(next) {
			recommenders.create(dataset, next)
		},
		function(recommender, next) {
			done(null, recommender)
		}
	], done)
			
}