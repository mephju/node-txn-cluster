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
			cluster(dataset, next)
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


var cluster = function(dataset, done) {
	log('trainer.cluster')
	async.waterfall([
		function(next) {
			clustering.buildClusters(dataset, next)
		},
		function(clusters, next) {
			log.green('clusters have been built')
			// read clusters from db again so we can remove 
			// the previous step if we want to skip it
			clustering.buildClustersFromDb(dataset, next)
		},
		function(clusters, next) {
			log.green('finished training the recommender')
			done()
		}
	], done)
}




startTraining()
	
	