require('../init')
var Run = require('./Run')
var TxnModel = app.models.TxnModel
var recommenders 		= require('../recommenders')

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
			txnRows.forEach(function(txnRow, i) {
				txnRow = _.unique(txnRow['item_ids'])
			})
			txnRows = txnRows.filter(function(txn) {
				return txn.length > dataset.config.N
			})
			txnRows = txnRows.filter(function(txn) {
				return Math.round(Math.random()) > 0
			})

			log.blue('got txnrows')
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
		function(recommenders, next) {
			log.blue('gotRecommenders', Object.keys(recommenders))
			if(dataset.config.RECOMMENDER === 'AprioriBased') {
				recommender = recommenders.aprioriBased
			} 
			else if(dataset.config.RECOMMENDER === 'SessionBased') {
				recommender = recommenders.sessionBased
			}
			else if(dataset.config.RECOMMENDER === 'PopularityBased') {
				log.blue('returning popularityBased recommender')
				recommender = recommenders.popularityBased
			}
			else {
				throw new Error('unknown recommender type found', dataset.config.RECOMMENDER)
			}
			done(null, recommender)
		}
	], done)
			
}