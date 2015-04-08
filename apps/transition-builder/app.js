require('../init')

var transitions = require('./transitions')
var clustering = require('../trainer/clustering')



var buildTrainingConfigs = function() {

	var evalConfig = new app.EvalConfig()
	var trainingRuns = []

	help.comboCall(
		evalConfig.datasets,
		evalConfig.distanceMeasures,
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



var buildTransitions = function() {
	
	log('buildTransitions')

	var trainingRuns = buildTrainingConfigs()
	
	

	var bag = {}

	async.eachChain(
		trainingRuns,
		function(dataset, next) {		
			bag.dataset = dataset
			bag.transModel 	= new app.models.TransitionModel(dataset)
			bag.transModel.init(next)
		},
		function(next) {
			log('buildTransitions', 'init done')
			new app.models.TxnModel(bag.dataset).getClusteredTxns(next)
		},
		function(txnRows, next) {
			log('buildTransitions', 'getClusteredTxns done')
			bag.txnRows = txnRows
			clustering.buildClustersFromDb(bag.dataset, next)
		},
		function(clusters, next) {
			log('buildTransitions', 'buildClustersFromDb done, clusters.length', clusters.clusters.length)
			transitions.findTransitions(bag.transModel, clusters, bag.txnRows, next)
		},
		function(err) {
			log.yellow('finished building transitions', err || '')
		}
	);
}





buildTransitions()