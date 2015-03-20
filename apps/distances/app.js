/*
 * 	movielens 		23000 txns 		05750 MB storage
 * 	lastfm 			61000 txns 		15250 MB storage
 * 	gowalla 		70000 txns 		17500 MB storage
 *
 * distances require 250 MB per 1000 txns 
 */

require('../init')




var Config = app.Config
var evalConfig = new app.EvalConfig()
var DistanceRun = require('./distance-run').DistanceRun

var datasets = []

app.comboCall(
	evalConfig.datasets,
	evalConfig.distanceMeasures,
	function(datasetRaw, measure) {

		var original = datasetRaw.dataset 
		var dataset = new original.constructor(original.filepath, original.name)

		log.red(datasetRaw.dataset.name, measure)
		var configOptions = {
			distanceMeasure: measure,
		}
		var config = new Config(configOptions)
		dataset.config = config
		datasets.push(dataset)
	}
);


datasets.forEach(function(item, i) {
	log(item.name, item.config.DISTANCE_MEASURE)
})


async.eachChain(
	datasets,
	function(dataset, next) {
		new DistanceRun(dataset).run(function(err) {
			log.yellow('done computing distances for', dataset.name, dataset.config.DISTANCE_MEASURE, err)
			next(err)	
		})
	},
	function(err) {
		log.yellow('finished with all datasets and distance measures', err)
	}
);

