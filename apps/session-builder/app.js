
var importApp = require('./import')
var txnApp = require('./transactions')

require('../init')

var TxnModel 		= require('./transactions/model').Model



var buildSessions = function(dataset, done) {
	log('buildSessions', dataset.name)
	async.waterfall([
		function(next) {
			importApp.makeImport(dataset, next)
		},
		function(next) {
			log.green('feedback improted')
			//at this point the dataset has been inserted 
			//into a datasetName_feedback table
			log('build txns')
			txnApp.buildTxns(dataset, next)
		},
		function(next) {
			new TxnModel(dataset).txnsForTraining(next)
		},
		function(txnRows, next) {
			log('sessions built!', dataset.name)
			done()
		}
	], 
	function(err) {
		log.red('session-builder error: ', err)
	})
}


var evalConfig = new app.EvalConfig()
var datasets = evalConfig.datasets.map(function(set) {
	return set.dataset
})
async.eachSeries(
	datasets,
	function(dataset, next) {
		log(dataset)
		dataset.config = new app.Config({})
		buildSessions(dataset, next)
	},
	function(err) {
		if(err) {
			return log.red('Could not build sessions for all datasets', err)
		}
		log.yellow('sessions built for all datasets', datasets)
	}
);

	