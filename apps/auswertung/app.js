require('../init')
var Nedb	= require('nedb')

var dataset = null 

log(process.env.DATASET)
if(process.env.DATASET === 'movielens') {
	dataset = app.datasets.movielens
}
else if(process.env.DATASET === 'lastfm') {
	dataset = app.datasets.lastFm
}
else if(process.env.DATASET === 'movielensCustom') {
	dataset = app.datasets.movielensCustom
}
else {
	dataset = app.datsets.movielensCustom
}

var filename = dataset.basePath + '/results-from-server/evaluation-baseline-' + dataset.name + '.db'

var db = new Nedb({ 
	filename:  filename,
	autoload: true
});

var baselineResults = function() {
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
	db
	.find({})
	.sort({ 'config.DISTANCE_MEASURE':1, 'config.MARKOV_ORDER':1, 'config.ITEM_CHOICE_STRATEGY':1,'config.CROSS_VALIDATION_RUN':1 })
	.exec(function (err, docs) {
	 //  docs.forEach(function(doc) {
		// console.log(
		// 	doc.config.DISTANCE_MEASURE, 
		// 	doc.config.MARKOV_ORDER, 
		// 	doc.config.ITEM_CHOICE_STRATEGY, 
		// 	doc.config.CROSS_VALIDATION_RUN,
		// 	doc.precision
		// );  	
		// //console.log(doc.numTxns, doc.numTxnsTraining, doc.numTxnsValidation)
	 //  });

	  for(var i=0; i<docs.length; i=i+3) {
	  	
	  	var doc = docs[i]
	  	var precision1 = docs[i].precision
	  	var precision2 = docs[i+1].precision
	  	var precision3 = docs[i+2].precision
	  	
	 //  	console.log(
		// 	doc.config.DISTANCE_MEASURE, 
		// 	doc.config.MARKOV_ORDER, 
		// 	doc.config.ITEM_CHOICE_STRATEGY, 
		// 	doc.config.CROSS_VALIDATION_RUN,
		// 	doc.numClusters,
		// 	precision1,
		// 	precision2,
		// 	precision3,
		// 	(precision1+precision2+precision3)/3.0
		// );	

	  }
	  log(docs[0])
	  docs = flatten(docs)


	  log(docs[0])
	  log('dataset', 'sessionCutoff', 'minClusterSize', 
	  	'distance', 'markov', 'strategy', 'xvalidation', 
	  	'numClusters', 'clusteredTxns', 'numTxns', 
	  	'numTxnsTraining', 'numTxnsValidation', 'precision'
	  );

	  docs.forEach(function(doc, i) {
		  console.log(
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
	);
	  })

	  
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

// methodResults()