function EvalConfig() {
	this.markovOrders = [1,2,3]
	this.xValidationRuns = [0,1,2,3]
	this.distanceMeasures = ['levenshtein']
	this.itemChoiceStrategies = ['tfidf', 'bestItemsOfCluster', 'bestItemsOverall', 'tfTfidf', 'random', 'withRatings']
	this.datasets = [{ 
		dataset: app.datasets.movielensCustom, 
		txnCount: 1500 
	}]
	// this.datasets = [{ 
	// 	dataset: app.datasets.movielensSmall, 
	// 	txnCount: 200 
	// }]
	this.datasets = [{
		dataset: app.datasets.movielens,
		txnCount:0
	}, {
		dataset: app.datasets.lastFm,
		txnCount:0
	},{
		dataset: app.datasets.gowalla,
		txnCount:0
	}]
}

// function EvalConfig() {
// 	this.markovOrders = [1]
// 	this.xValidationRuns = [0]
// 	this.distanceMeasures = ['levenshtein']
// 	this.itemChoiceStrategies = ['tfidf']
// 	this.datasets = [{ 
// 		dataset: app.datasets.movielensCustom, 
// 		txnCount: 1500 
// 	}]
// 	// this.datasets = [{ 
// 	// 	dataset: app.datasets.movielensSmall, 
// 	// 	txnCount: 200 
// 	// }]
// }


module.exports = exports.EvalConfig = EvalConfig