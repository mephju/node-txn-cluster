require('../init')
var clustering = require('./clustering')


var buildTrainingConfigs = function() {

	var evalConfig = new app.EvalConfig()
	var trainingRuns = []

	help.comboCall(

		evalConfig.datasets,
		evalConfig.distanceMeasures,
		evalConfig.xValidationRuns,

		function(datasetRaw, measure, run) {
			
			var original = datasetRaw.dataset 
			var dataset = new original.constructor(original.filepath, original.name)
			
			var configOptions = {
				distanceMeasure: measure,
				markovOrder: 1, //irrelevant here because we are just clustering, not building markov chains
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
			}

			dataset.config = new app.Config(configOptions)
			dataset.config.configOptions = configOptions

			trainingRuns.push(dataset)
		}
	);

	return trainingRuns

	return trainingRuns.filter(function(run) {
		return run.config.DISTANCE_MEASURE == 'levenshtein' && run.config.CROSS_VALIDATION_RUN === 1
	})
}




var startTraining = function() {
	
	var trainingRuns = buildTrainingConfigs()

	trainingRuns.forEach(function(dataset, i) {
		log.cyan(
			dataset.name, 
			dataset.config.DISTANCE_MEASURE, 
			dataset.config.CROSS_VALIDATION_RUN
		);
	})

	log.magenta('About to start trainingRuns', trainingRuns.length, 'using cores', app.config.USE_CORES)
		

	async.eachSeries(
		trainingRuns,
		function(dataset, next) {
			cluster(dataset, next)
		},
		function(err) {
			log(err)
		}
	);

	// clustering.buildClustersParallel(trainingRuns, function(err) {
	// 	log.red(err)
	// })

}


var cluster = function(dataset, done) {
	log('trainer.cluster')
	async.waterfall([
		function(next) {
			clustering.buildClusters(dataset, next)
		},
		function(clusters, next) {
			log.green('clusters have been built')
			log.green('finished training a recommender')
			done()
		}
	], done)
}




startTraining()
	
	