require('../init')
var Run = require('./Run')
var TxnModel = app.models.TxnModel
var recommenders 		= require('../recommenders')

process.on('message', function(data) {
	log('CHILD got message', data)	
	launch(data)	
})


var launch = function(data) {
	
	var dataset = app.datasets.Dataset.rebuild(data)
	
	var recommender = null

	async.waterfall([
		function(next) {
			recommenders.create(dataset, next)
		},
		function(recommenders, next) {
			recommender = recommenders.sessionBased
			new TxnModel(dataset).txnsForValidation(next)					
		},
		function(txnRows, next) {
			//We are only interested in txns having a length greater than N+1
			txnRows = txnRows.filter(function(txn) {
				return txn['item_ids'].length > dataset.config.N
			})
			log.blue('got txnrows')
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