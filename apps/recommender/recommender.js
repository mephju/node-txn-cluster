function Recommender(dataset) {
	this.dataset = dataset
}


Recommender.prototype.recommend = function() {}




function SessionBasedRecommender(dataset, itemChoice) {
	Recommender.call(this, dataset)
	this.itemChoice = itemChoice

}

function MostPopularRecommender() {
	Recommender.call(this)
}

function AprioriRecommender() {
	Recommender.call(this)
}

SessionBasedRecommender.prototype = Object.create(Recommender.prototype, {
	constructor: SessionBasedRecommender
})


