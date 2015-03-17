var ClusterGroup		= require('../../trainer/clustering/cluster-group')
var MarkovChain 		= require('../../trainer/transition-builder/markov-chain').MarkovChain
var MarkovInfo 			= require('../../trainer/transition-builder/markov-info').MarkovInfo
var ItemChoice 			= require('./item-choice')
var clustering 			= require('../../trainer/clustering')
var SessionBasedRecommender = require('./session-based-recommender')


exports.create = function(dataset, fallbackItems, done) {
	console.log('init recommender')

	var params = {
		dataset: dataset,
		fallbackItems: fallbackItems
	}
	
	async.waterfall([
		function(next) {
			clustering.buildClustersFromDb(dataset, next)
		},
		function(clusters, next) {
			params.clusters = clusters
			params.itemChoice = new ItemChoice(dataset, next)
			params.itemChoice.init(next)
		},
		function(next) {
			MarkovChain.getMarkovChain(dataset, next)
		},
		function(markovChain, next) {
			params.markovInfo = new MarkovInfo(markovChain)
			var sessionRecommender = new SessionBasedRecommender(params)
			done(null, sessionRecommender)
		}
	], function(err) {
		if(err) { console.log('recommend/app error during init', err) } 
		done(err)
	})
}
