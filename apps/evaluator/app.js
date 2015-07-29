require('../init')
var EvalModel = app.models.EvalModel
var cp = require('child_process')
var ClusterModel = require('../trainer/clustering/model')





var evaluate = function(dataset, done) {
		
	var child = cp.fork(__dirname + '/evaluation-runner.js')
	
	child.send({
		dataset: dataset,
	})

	child.on('message', function(result) {
		log.blue('got precision', result.precision, dataset.name)
		child.disconnect()
		q.push({
			precision:result.precision,
			dataset: dataset,
		}, done)	
	})

}


var configureRuns = function() {
	var evalConfig = new app.EvalConfig()
	var evaluationRuns = []

	help.comboCall(

		evalConfig.datasets,
		evalConfig.distanceMeasures,
		evalConfig.markovOrders,
		evalConfig.itemChoiceStrategies,
		evalConfig.xValidationRuns,

		function(datasetRaw, measure, order, strategy, run) {
			log.yellow('configuring', datasetRaw.dataset.name, measure, order, strategy, run)
			var original = datasetRaw.dataset 
			
			
			var configOptions = {
				distanceMeasure: measure,
				markovOrder: order,
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
				itemChoiceStrategy: strategy,
			}

			var dataset = new original.constructor(
				original.filepath, 
				original.name				
			);

			dataset.config = new app.Config(configOptions)
			dataset.config.configOptions = configOptions
			

			evaluationRuns.push(dataset)
		}
	);

	/*
		REMOVE FILTER LATER
	 */
	// evaluationRuns = evaluationRuns.filter(function(d) {

	// 	if(d.config.CROSS_VALIDATION_RUN === 0 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'bestItemsOfCluster') return false 
	// 	if(d.config.CROSS_VALIDATION_RUN === 1 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'bestItemsOfCluster') return false
	// 	if(d.config.CROSS_VALIDATION_RUN === 2 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'bestItemsOfCluster') return false
	// 	if(d.config.CROSS_VALIDATION_RUN === 0 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'tfidf') return false
	// 	if(d.config.CROSS_VALIDATION_RUN === 1 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'tfidf') return false
	// 	if(d.config.CROSS_VALIDATION_RUN === 2 && d.config.MARKOV_ORDER === 1 && d.config.ITEM_CHOICE_STRATEGY === 'tfidf') return false

	// 	return true
	// })

	return evaluationRuns
}

var q = async.queue(function(task, done) {
	new EvalModel(task.dataset).insert(task.precision, done)
}, 1)


var start = function() {

	log('evaluator app start')

	var start = new Date().getTime()
	
	var evaluationRuns = configureRuns()
	
	log('evaluationRuns', evaluationRuns.length)

	async.waterfall([
		function(next) {
			async.eachSeries(
				evaluationRuns,
				function(dataset, next) {
					new ClusterModel(dataset).createIndices(next)
				},
				function(err) {
					next(err)
				}
			);
		},
		function(next) {
			async.eachLimit(
				evaluationRuns, 
				app.config.USE_CORES, 
				function(dataset, next) {
					evaluate(dataset, next)			
				}, 
				function(err) {
					var end = new Date().getTime()
					var duration = end - start
					log.yellow('finished evaluating ', duration)
					if(err) log.red(err)
				}
			);
		}
	], function(err) {
		if(err) throw err
	})

			

}
	

start()