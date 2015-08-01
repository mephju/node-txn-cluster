require('../init')
var Nedb	= require('nedb')

var dataset = null 


if(process.env.DATASET === 'movielens') {
	dataset = app.datasets.movielens
}
else if(process.env.DATASET === 'lastfm') {
	dataset = app.datasets.lastFm
}
else if(process.env.DATASET === 'movielensCustom') {
	dataset = app.datasets.movielensCustom
}
else if(process.env.DATASET === 'gowalla') {
	dataset = app.datasets.gowalla
}
else {
	dataset = app.datsets.movielensCustom
}


dataset = app.datasets.lastFm1k
	

var baselineResults = function() {
	var filename = dataset.basePath + '/results-from-server/evaluation-baseline-' + dataset.name + '.db'

	log(dataset.name)
	var db = new Nedb({ 
		filename:  filename,
		autoload: true
	});
	db
	.find({})
	.sort({ 'config.RECOMMENDER': 1 })
	.exec(function(err, docs) {
		console.log('baseline, xvalidation, precision')
		docs.forEach(function(doc) {
			console.log(
				doc.config.RECOMMENDER + ',',
				doc.config.CROSS_VALIDATION_RUN + ',',
				doc.precision
			);
		})
	})
}


baselineResults()




var methodResults = function() {

	console.log(dataset)

	var filename = dataset.basePath + '/results-from-server/evaluation-' + dataset.name + '.db'

	var db = new Nedb({ 
		filename:  filename,
		autoload: true
	});

	db
	.find({
		createdAt: {'$gt': new Date('07-07-2015') }
	})
	.sort({

		'config.DISTANCE_MEASURE':1, 
		'config.MARKOV_ORDER':1, 
		'config.ITEM_CHOICE_STRATEGY':1,
		'config.CROSS_VALIDATION_RUN':1
	})
	.exec(function (err, docs) {
	  log(docs[0])
	  docs = flatten(docs)


	  log(docs[0])
	  log('dataset, sessionCutoff, minClusterSize, distance, markov, strategy, xvalidation, numClusters, clusteredTxns, numTxns, numTxnsTraining, numTxnsValidation, precision');

	  docs.forEach(function(doc, i) {
	  	var array = [
	  		doc.dataset,  
		 	doc.sessionCutoff,
		 	doc.minClusterSize,
		 	doc.distance,
		 	doc.markov,
		 	doc.strategy,
		 	doc.xvalidation,
		 	doc.numClusters,
		 	doc.clusteredTxns,
		 	doc.numTxns,
		 	doc.numTxnsTraining,
		 	doc.numTxnsValidation,
		 	doc.precision
	  	]
	  	var array = [
	  		'["' + doc.distance + '"',
		 	doc.markov,
		 	'"' + doc.strategy + '"',
		 	doc.xvalidation,
		 	'],',
	  	]
		console.log(array.join(', '))
		
	  })

	  console.log(docs.length)
	  
	});
}
	


var flatten = function(docs) {
	return docs.map(function(doc) {
		return {
			dataset: 		doc.dataset.name,
			sessionCutoff: 	doc.dataset.timeDistance,
			minClusterSize: doc.config.MIN_CLUSTER_SIZE,
			distance: 		doc.config.DISTANCE_MEASURE,
			markov: 		doc.config.MARKOV_ORDER,
			strategy: 		doc.config.ITEM_CHOICE_STRATEGY,
			xvalidation: 	doc.config.CROSS_VALIDATION_RUN,
			numClusters: 	doc.numClusters,
			clusteredTxns: 	doc.clusteredTxns,
			numTxnsTraining: 	doc.numTxnsTraining,
			numTxnsValidation: 	doc.numTxnsValidation,
			numTxns: 			doc.numTxns,
			precision: 			doc.precision

		}
	})

}

methodResults()