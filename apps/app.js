require('./init')


var trainer 			= require('./trainer')
var evaluator 			= require('./evaluator')
var recommenders 		= require('./recommenders')



log.magenta('session based recommender start' )


var datasetsRaw = [{ 
	dataset: app.datasets.movielensCustom, 
	txnCount: 1500 
}]
// var datasetsRaw = [{ 
// 	dataset: app.datasets.movielensSmall, 
// 	txnCount: 200 
// }]

var markovOrders = [1, 2, 3]
var xValidationRuns = [0, 1, 2, 3]
var itemChoiceStrategies = ['tfidf', 'bestItemsOfCluster', 'bestItemsOverall', 'tfTfidf', 'random', 'withRatings']
var distanceMeasures = ['levenshtein']


var startTraining = function() {
	var bag = {}

	var trainingRuns = []

	help.comboCall(
		datasetsRaw,
		distanceMeasures,
		markovOrders,
		xValidationRuns,
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

	async.eachChain(
		trainingRuns,
		function(dataset, next) {
			bag.dataset = dataset
			trainer.trainRecommender(dataset, next)
		},
		// function(next) {
		// 	log('recommenders.create')
		// 	recommenders.create(bag.dataset, next)
		// },
		// function(recommenders, next) {
		// 	log('evaluator.run')
		// 	bag.recommenders = recommenders

		// 	evaluator.run(bag.dataset, bag.recommenders.sessionBased, next)
		// },
		// function(precision, next) {
		// 	log.green('iteration complete, precision is', precision, bag.dataset.name)
		// 	next()
		// },
		function(next) {
			log.green('finished training session based recommender')
			next()
		},
		function(err) {
			log.yellow('finished training all recommenders?')
			if(err) return log.red(err)

			startEvaluation()
		}
	);

}



	

var startEvaluation = function() {
	var bag = {}

	async.eachChain([
		datasetConfigs,
		function(dataset, next) {
			bag.dataset = dataset
			recommenders.create(bag.dataset, next)
		},
		function(recommenders, next) {
			bag.recommenders = recommenders
			evaluator.run(bag.dataset, bag.recommenders.sessionBased, next)
		},
		function(precision, next) {
			log.green('iteration complete, precision is', precision, bag.dataset.name)
			next()
		},
		function(err) {

		}
	])
}


startTraining()
//startEvaluation()

	
	