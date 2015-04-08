require('../init')



var MarkovChain = require('./markov-chain').MarkovChain



var buildTrainingConfigs = function() {

	var evalConfig = new app.EvalConfig()
	var trainingRuns = []

	help.comboCall(
		evalConfig.datasets,
		evalConfig.distanceMeasures,
		evalConfig.markovOrders,
		evalConfig.xValidationRuns,

		function(datasetRaw, measure, order, run) {
			
			var original = datasetRaw.dataset 
			var dataset = new original.constructor(original.filepath, original.name)
			
			var configOptions = {
				distanceMeasure: measure,
				markovOrder: order,
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
			}

			dataset.config = new app.Config(configOptions)		
			trainingRuns.push(dataset)
		}
	);

	return trainingRuns
}



var buildMarkovChains= function() {
	
	log('buildMarkovChains')

	var trainingRuns = buildTrainingConfigs()
	
	async.eachChain(
		trainingRuns,
		function(dataset, next) {				
			new MarkovChain(dataset).build(next)
		},
		function(err) {
			log.yellow('finished building markov chains', err || '')
		}
	);
}





buildMarkovChains()