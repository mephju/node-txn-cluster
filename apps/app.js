require('./init')

var datasets 			= require('./datasets').all
var configs 			= require('./config').all

var trainer 			= require('./trainer')
var evaluator 			= require('./evaluator')
var recommenders 		= require('./recommenders')


// var left = [0,1,0,2,3,4], right = [0,1,2]
// var intersection = help.intersectNum(left, right)
// return console.log(intersection, left, right)
var a = []
for(var i=1; i<70000; i++) {
	a.push(i/70000)
}
return console.log(a)


log.magenta('session based recommender start' )

async.eachSeries(
	datasets,
	function(dataset, next) {
		processDataset(dataset, next)
	},
	function(err) {
		log.yellow('finished session based recommender exec')
		if(err) log.red(err)
	}
);


function processDataset(dataset, done) {
	log('processDataset', dataset)

	var bag = {}
	
	async.waterfall([
		function(next) {
			trainer.trainRecommender(dataset, next)
		},
		function(next) {
			recommenders.create(dataset, next)
		},
		function(recommenders, next) {
			bag.recommenders = recommenders

			evaluator.run(dataset, bag.recommenders.sessionBased, next)
		},
		function(precision, next) {
			log.green('iteration complete, precision is', precision, dataset)
			next()
		}

	], done)
} 