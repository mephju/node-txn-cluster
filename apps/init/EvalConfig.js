function EvalConfigProd() {
	this.useCores = 7
	this.baselines = ['PopularityBased', 'AprioriBased']
	//this.baselines = ['PopularityBased']
	this.markovOrders = [1,2,3]
	this.xValidationRuns = [0,1,2]
	this.distanceMeasures = ['levenshtein', 'jaccard', 'jaccard-bigram', 'jaccard-levenshtein']

	this.itemChoiceStrategies = ['tfidf', 'bestItemsOfCluster', 'bestItemsOverall', 'tfTfidf', 'random', 'withRatings']
	this.itemChoiceStrategies = ['tfidf', 'bestItemsOfCluster', 'bestItemsOverall', 'tfTfidf', 'random']
	//this.itemChoiceStrategies = ['tfidf', 'bestItemsOverall', 'tfTfidf', 'random', 'withRatings']

	this.datasets = [
		// {
		// 	dataset: app.datasets.movielensCustom, 
		// 	txnCount: 1500 
		// },
		// {
		// 	dataset: app.datasets.movielens,
		// 	txnCount:0
		// }, 
		{
			dataset: app.datasets.lastFm,
			txnCount:0
		},
		// {
		// 	dataset: app.datasets.gowalla,
		// 	txnCount:0
		// }
	];
}

function EvalConfigDev() {
	this.useCores = 3
	this.baselines = ['PopularityBased', 'AprioriBased']
	this.baselines = ['AprioriBased']
	this.baselines = ['PopularityBased']
	this.markovOrders = [1]
	this.xValidationRuns = [0, 1, 2]
	this.distanceMeasures = ['levenshtein', 'jaccard', 'jaccard-bigram', 'jaccard-levenshtein']
	this.distanceMeasures = ['jaccard']
	
	this.itemChoiceStrategies = ['tfidf', 'bestItemsOfCluster', 'bestItemsOverall', 'tfTfidf', 'random', 'withRatings']
	this.itemChoiceStrategies = ['tfidf']

	this.datasets = [{ 
		dataset: app.datasets.movielensCustom, 
		txnCount: 1500 
	}]
	
	this.datasets = [
		{ 
			dataset: app.datasets.movielensCustom, 
			txnCount: 2000,
		},
		// { 
		// 	dataset: app.datasets.lastFmSmall, 
		// 	txnCount: 1870,
		// },
		// { 
		// 	dataset: app.datasets.gowallaSmall, 
		// 	txnCount: 5329,
		// }
	];
}

if(DEV) {
	module.exports = exports.EvalConfig = EvalConfigDev
} else {
	module.exports = exports.EvalConfig = EvalConfigProd
}
