//Transaction Builder
//Build transaction out of datasets containing user feedback such as ratings or watches
//	1. Load dataset into db

var reader 			= require('./feedback-import')
var db 				= require('./db')
var datasetDefs 	= require('./dataset-defs')
var async			= require('async')
var dataset 		= datasetDefs.dataset()
var txnApp 			= require('./transactions/app')
var sequenceApp		= require('./sequences/app')
var clusterApp		= require('./clustering/app')


var startTime = new Date().getTime()

async.series([
	function(next) {
		console.log('db.prepare')
		
		db.prepare(dataset, next)
	},
	function(next) {
		importSets(next)
	},
	function(next) {
		console.log('build txns')
		txnApp.buildTxns(next)
	}, 
	function(next) {
		console.log('find and build subsequences')
		sequenceApp.findSequences(next)
	},
	function(next) {
		console.log('start cluserting')
		clusterApp.start(next)
	}
], 
function(err, results){
	err && console.log(err)
	console.log('finished', datasetDefs.dataset())
	console.log('time: ', (new Date().getTime() - startTime) / 1000)
})



var importSets = function(next) {
	console.log('importSets')
	var dataset = datasetDefs.dataset()

	console.log('going to import ' + dataset.datasetPath)
	reader.import(dataset, next)

}



	








