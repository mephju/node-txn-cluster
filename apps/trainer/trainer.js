var clustering = require('./clustering')
var transitionBuilder = require('./transition-builder')

exports.trainRecommender = function(dataset, done) {
	log('trainRecommender')
	async.waterfall([
		function(next) {
			clustering.buildClusters(dataset, next)
		},
		function(clusters, next) {
			log.green('clusters have been built')
			// read clusters from db again so we can remove 
			// the previous step if we want to skip it
			clustering.buildClustersFromDb(dataset, next)
		},
		function(clusters, next) {
			transitionBuilder.buildTransitions(dataset, clusters, next)	
		},
		function(next) {
			log.green('finished training the recommender')
			next()
		}
	], done)
}