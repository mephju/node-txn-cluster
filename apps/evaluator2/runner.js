require('../init')
var Run = require('./Run')
var TxnModel = app.models.TxnModel
var recommenders 		= require('../recommenders')

process.on('message', function(data) {
	log('CHILD got message', data)

	
	
	launch(data)	
})


var launch = function(data) {
	
	var dataset = null
	
	if(data.dataset.name.indexOf('movielens') !== -1) {
		dataset = new app.datasets.Movielens(
			data.dataset.filepath,
			data.dataset.name
		);
	} 
	else if(data.dataset.name.indexOf('last') !== -1) {
		dataset = new app.datasets.LastFm(
			data.dataset.filepath,
			data.dataset.name
		);
	} 
	else if(data.dataset.name.indexOf('gowalla') !== -1) {
		dataset = new app.datasets.Gowalla(
			data.dataset.filepath,
			data.dataset.name
		);
	}

	dataset.config = new app.Config(data.dataset.config.configOptions)
	
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