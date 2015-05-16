var AprioriRecommender = require('./AprioriRecommender')


exports.create = function(dataset, done) {
	log.blue('init AprioriRecommender based recommender')

	var recommender = new AprioriRecommender(dataset)
	
	async.waterfall([
		function(next) {
			recommender.init(next)
		},
		function(next) {
			log.blue('init aprioribased done')
			done(null, recommender)
		}
	], 
	function(err) {
		if(err) { console.log('apriori based recommender / app error during init', err) } 
		done(err)
	})
}