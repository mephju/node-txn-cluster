require('../init')

var TxnModel			= require('../session-builder/transactions/model').Model
var TransitionModel		= require('./TransitionModel')

var MarkovChain = require('./markov-chain').MarkovChain
var transitions = require('./transitions')
var clustering = require('../trainer/clustering')



var buildTrainingConfigs = function() {

	var evalConfig = new app.EvalConfig()
	var trainingRuns = []

	help.comboCall(

		evalConfig.datasets,
		evalConfig.distanceMeasures,
		evalConfig.markovOrders,
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
			bag.transModel 	= new TransitionModel(dataset)
			bag.transModel.init(next)
		},
		function(next) {
			log('buildTransitions', 'init done')
			new TxnModel(bag.dataset).getClusteredTxns(next)
		},
		function(txnRows, next) {
			log('buildTransitions', 'getClusteredTxns done')
			bag.txnRows = txnRows
			clustering.buildClustersFromDb(bag.dataset, next)
		},
		function(clusters, next) {
			log.green(clusters)
			log('buildTransitions', 'buildClustersFromDb done, clusters.length', clusters.length)
			transitions.findTransitions(bag.transModel, clusters, bag.txnRows, next)
		},
		function(next) {
			new MarkovChain(bag.dataset, bag.transModel).build(next)
		},
		function(err) {
			log.yellow('finished building transitions', err || '')
		}
	);
}


buildTransitions()