var Recommender = require('../recommender')

function PopularityBasedRecommender(dataset, popularItems) {
	Recommender.call(this, dataset)
	this.popularItemMap = buildItemMap(popularItems)
	this.popularItems = popularItems
}

PopularityBasedRecommender.prototype = Object.create(Recommender.prototype, {
	constructor: PopularityBasedRecommender
})

PopularityBasedRecommender.prototype.recommend = function(sessionBegin, n) {
	//return [ 785, 592, 1097, 2544, 1359 ]
	return this.popularItemMap[n]
}

module.exports = PopularityBasedRecommender

var buildItemMap = function(popularItems) {
	console.log('buildItemMap')
	var popularItemMap = {}
	for(var i=1; i<=popularItems.length; i++) {
		popularItemMap[i] = popularItems.slice(0, i)
	}
	return popularItemMap
}

