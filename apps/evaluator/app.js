var run = require('./run')
var TxnModel = require('../session-builder/transactions/model').Model
var EvalModel = require('./EvalModel')

var recommenders 		= require('./recommenders')


var evaluate = function(dataset, recommender, done) {
	
	var bag = {}
	
	async.waterfall([
		function(next) {
			new TxnModel(dataset).txnsForValidation(next)					
		},
		function(txnRows, next) {
			var evalRun = new run.Run(dataset, recommender, txnRows)
			var precision = evalRun.start()
			bag.precision = precision
			new EvalModel(dataset).insert(precision, next)
			
		},
		function(next) {
			log.green('finished evaluation run for', dataset.name)
			done(null, bag.precision)
		}
	], done)
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
			
			var original = datasetRaw.dataset 
			var dataset = new original.constructor(original.filepath, original.name)
			
			var configOptions = {
				distanceMeasure: measure,
				markovOrder: order,
				crossValidationRun: run,
				txnCount: datasetRaw.txnCount,
			}

			dataset.config = new app.Config(configOptions)		
			evaluationRuns.push(dataset)
		}
	);

	return evaluationRuns
}




var start = function() {
	
	var evaluationRuns = configureRuns()
	var bag = {}

	async.eachChain(
		evaluationRuns,
		function(dataset, next) {
			bag.dataset = dataset
			
			recommenders.create(bag.dataset, next)
		},
		function(_recommenders, next) {
			bag.recommenders = _recommenders
			evaluate(bag.dataset, bag.recommenders.sessionBased, next)		
		},
		function(err) {
			log.yellow('finished evaluating ')
			if(err) log.red(err)
		}
	);


}
	

start()