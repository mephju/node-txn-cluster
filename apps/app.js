require('./init')
var datasets = require('./datasets').all

var trainer = require('./trainer')

log.magenta('session based recommender start' )
async.eachSeries(
	datasets,
	function(dataset, next) {
		processDataset(dataset, next)
	},
	function(err) {

	}
);


function processDataset(dataset, done) {
	log('processDataset', dataset)
	async.waterfall([
		function(next) {
			trainer.trainRecommender(dataset, next)
		},
		function(next) {
			
		}
	])
} 