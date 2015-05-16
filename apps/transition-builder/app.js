require('../init')

var transitions = require('./transitions')
var clustering = require('../trainer/clustering')
var cp = require('child_process')


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
				markovOrder: 0, //not important here
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
			}

			dataset.config = new app.Config(configOptions)		
			dataset.config.configOptions = configOptions
			trainingRuns.push(dataset)
		}
	);

	return trainingRuns
}



var buildTransitions = function(dataset, done) {
	
	log('buildTransitions')
	var bag = {}
	
	var child = cp.fork(__dirname + '/runner')
	child.on('message', function(transitions) {
		q.push({
			transitions: transitions,
			dataset: dataset
		}, function(err) {
			child.disconnect()
			done(err)
		})
	})

	child.send({
		dataset: dataset
	})

	log('buildTransitions', 'init done')
}



var q = async.queue(function(task, done) {
	new app.models.TransitionModel(task.dataset).insertTransitions(task.transitions, done)
}, 1)




var trainingRuns = buildTrainingConfigs()

async.eachChain(
	trainingRuns,
	function(dataset, next) {
		new app.models.TransitionModel(dataset).init(next)
	},
	function(err) {
		if(err) {
			return log.red(err)
		}
		async.eachLimit(
			trainingRuns,
			app.config.USE_CORES,
			function(dataset, next) {
				buildTransitions(dataset, next)
			},
			function(err) {
				if(err) log.red('Could not build transitions', err)
				else log.green('All transitions built')
			}
		);
	}
);


		