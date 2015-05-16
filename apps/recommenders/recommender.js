
function Recommender(dataset) {
	this.dataset = dataset
}

Recommender.prototype.recommend = function() {}
Recommender.prototype.reset = function() {}
Recommender.prototype.init = function(done) { done() }
module.exports = Recommender