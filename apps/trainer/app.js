require('../init')


var trainer 			= require('./trainer')


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





var startTraining = function() {
	
	var trainingRuns = buildTrainingConfigs()

	trainingRuns.forEach(function(dataset, i) {
		log.cyan(
			dataset.name, 
			dataset.config.DISTANCE_MEASURE, 
			dataset.config.MARKOV_ORDER, 
			dataset.config.CROSS_VALIDATION_RUN
		);
	})

	log.magenta('About to start trainingRuns', trainingRuns.length)

	async.eachChain(
		trainingRuns,
		function(dataset, next) {
			trainer.trainRecommender(dataset, next)
		},
		function(next) {
			log.green('finished training session based recommender')
			next()
		},
		function(err) {
			log.yellow('finished training all recommenders?')
			if(err) return log.red(err)
		}
	);

}




startTraining()
	
	