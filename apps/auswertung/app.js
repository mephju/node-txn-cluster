require('../init')
var Nedb	= require('nedb')

var dataset = app.datasets.movielensCustom
var db = new Nedb({ 
	filename: dataset.resultPath + 'evaluation-' + dataset.name + '.db' ,
	autoload: true
});

db
.find({})
.sort({ precision: 1 })
.exec(function (err, docs) {
  docs.forEach(function(doc) {
	console.log(
		doc.config.DISTANCE_MEASURE, 
		doc.config.CROSS_VALIDATION_RUN, 
		doc.config.MARKOV_ORDER, 
		doc.config.ITEM_CHOICE_STRATEGY, 
		doc.precision,
		new Date(doc.createdAt)
	);  	
	//console.log(doc.numTxns, doc.numTxnsTraining, doc.numTxnsValidation)
  });
  //console.log(docs[0])
  console.log(docs.length)
});

//http://www.notebooksbilliger.de/pc+systeme/hp+pavilion+500+455ng+amd+a+serie+apu+a8+6500