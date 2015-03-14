var run = require('./run')
var TxnModel = require('../session-builder/transactions/model').Model
var EvalModel = require('./eval-model').Model

exports.run = function(dataset, recommender, done) {
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
			done(null, bag.precision)
		}
	], done)
}