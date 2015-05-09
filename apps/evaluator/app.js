require('../init')
var run = require('./run')
var TxnModel = app.models.TxnModel
var EvalModel = app.models.EvalModel

var recommenders 		= require('../recommenders')


var evaluate = function(dataset, recommender, done) {
	
	var bag = {}
	
	async.waterfall([
		function(next) {
			new TxnModel(dataset).txnsForValidation(next)					
		},
		function(txnRows, next) {
			log.blue('got txnrows')
			var evalRun = new run.Run(dataset, recommender, txnRows)
			var precision = evalRun.start()
			bag.precision = precision
			log.blue('got precision', precision, dataset.name)
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
			

			evaluationRuns.push(dataset)
		}
	);

	return evaluationRuns
}




var start = function() {

	log('evaluator app start')
	
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