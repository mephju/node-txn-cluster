

var popularityBased 	= require('./popularity-based')
var sessionBased 		= require('./session-based')




/**
 *
 * Creates all recommenders

 * @param  {[type]}   dataset [description]
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
exports.create = function(dataset, done) {
	log('recommenders.create', dataset.name)

	var recommenders = {}
	
	async.waterfall([
		function(next) {
			popularityBased.create(dataset, next)
		},
		function(popularityBased, next) {
			recommenders.popularityBased = popularityBased
			log.green('fallbackItems', popularityBased.popularItems)
			var fallbackItems = recommenders.popularityBased.popularItems
			sessionBased.create(dataset, fallbackItems, next)
		},
		function(sessionBasedRecommender, next) {
			recommenders.sessionBased = sessionBasedRecommender
			log.green('recommenders created successfully')
			done(null, recommenders)
		}
	], function(err) {
		if(err) { console.log('recommend/app error during init', err) } 
		done(err)
	})
}



