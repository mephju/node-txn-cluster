require('../init')
var EvalModel = app.models.EvalModel
var cp = require('child_process')




var evaluate = function(dataset, done) {
		
	var child = cp.fork(__dirname + '/runner.js')
	
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

	async.eachLimit(
		evaluationRuns, 
		8, 
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

	// async.eachChain(
	// 	evaluationRuns,
	// 	function(dataset, next) {
	// 		evaluate(dataset, next)		
	// 	},
	// 	function(err) {
	// 		var end = new Date().getTime()
	// 		var duration = end - start
	// 		log.yellow('finished evaluating ', duration)
	// 		if(err) log.red(err)
	// 	}
	// );


}
	

start()