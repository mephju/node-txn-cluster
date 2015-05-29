require('../init')
var EvalModel = app.models.EvalModel
var cp = require('child_process')




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
		evalConfig.baselines,
		evalConfig.xValidationRuns,

		function(datasetRaw, baseline, run) {
			log.yellow('configuring', datasetRaw.dataset.name, baseline, run)
			var original = datasetRaw.dataset 
			
			
			var configOptions = {
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
				baseline: baseline,
				distanceMeasure: 'jaccard',
				markovOrder: 1,
				txnCount: datasetRaw.txnCount,
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
	new EvalModel(task.dataset, 'baseline').insert(task.precision, done)
}, 1)


var start = function() {

	log('evaluator app start')

	var start = new Date().getTime()
	
	var evaluationRuns = configureRuns()
	
	log('evaluationRuns', evaluationRuns.length)

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
	

start()