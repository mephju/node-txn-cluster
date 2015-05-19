require('../init')
var Nedb	= require('nedb')

var dataset = null 

log(process.env.DATASET)
if(process.env.DATASET === 'movielens') {
	dataset = app.datasets.movielens
}
else if(process.env.DATASET === 'movielensCustom') {
	dataset = app.datasets.movielensCustom
}
else {
	dataset = app.datsets.movielensCustom
}

var db = new Nedb({ 
	filename: dataset.resultPath + 'evaluation-' + dataset.name + '.db' ,
	autoload: true
});

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
  	
  	console.log(
		doc.config.DISTANCE_MEASURE, 
		doc.config.MARKOV_ORDER, 
		doc.config.ITEM_CHOICE_STRATEGY, 
		doc.config.CROSS_VALIDATION_RUN,
		precision1,
		precision2,
		precision3,
		(precision1+precision2+precision3)/3.0
	);	
  }

  console.log(docs.length)
});

//http://www.notebooksbilliger.de/pc+systeme/hp+pavilion+500+455ng+amd+a+serie+apu+a8+6500