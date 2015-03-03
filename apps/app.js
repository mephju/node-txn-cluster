require('./init')
var datasets = require('./datasets').all

var trainer 	= require('./trainer')
var evaluator 	= require('./evaluator')

log.magenta('session based recommender start' )
async.eachSeries(
	datasets,
	function(dataset, next) {
		processDataset(dataset, next)
	},
	function(err) {
		log.yellow('finished session based recommender exec', err)
	}
);


function processDataset(dataset, done) {
	log('processDataset', dataset)
	async.waterfall([
		function(next) {
			trainer.trainRecommender(dataset, next)
		},
		function(next) {
			evaluator.run(dataset, next)
		}
	], done)
} 