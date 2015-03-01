require('../init')
var importApp = require('./import')
var txnApp = require('./transactions')

var datasets = require('../datasets')




var buildSessions = function(dataset, done) {
	log('buildSessions', dataset.name)
	async.waterfall([
		function(next) {
			importApp.makeImport(dataset, next)
		},
		function(next) {
			//at this point the dataset has been inserted 
			//into a datasetName_feedback table
			log('build txns')
			txnApp.buildTxns(dataset, next)
		},
		function(next) {
			log('sessions built!', dataset.name)
			done()
		}
	], function(err) {
		log.red('session-builder error: ', err)
	})
}

async.eachSeries(
	datasets.all,
	function(dataset, next) {
		buildSessions(dataset, next)
	},
	function(err) {
		if(err) {
			return log.red('Could not build sessions for all datasets', err)
		}
		log.yellow('sessions built for all datasets', datasets)
	}
);

	