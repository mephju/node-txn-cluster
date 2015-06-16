require('../../init')
var cp = require('child_process')


var buildTrainingConfigs = function() {
	var evalConfig = new app.EvalConfig()
	var trainingRuns = []
	help.comboCall(
		evalConfig.datasets,
		evalConfig.xValidationRuns,
		function(datasetRaw, run) {
			var original = datasetRaw.dataset 
			var dataset = new original.constructor(original.filepath, original.name)
			var configOptions = {
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



var start = function() {
	var trainingRuns = buildTrainingConfigs()
	async.eachLimit(
		trainingRuns,
		app.config.USE_CORES,
		function(dataset, next) {
			var child = cp.fork(__dirname + '/runner')
			child.on('message', function() {
				child.disconnect()
				next(null)
			})
			child.send({dataset: dataset})
		},
		function(err) {
			if(err) return log.red(err)
			log.green('finished training apriori based recommender')
		}
	);
}

start()

	