//Transaction Builder
//Build transaction out of datasets containing user feedback such as ratings or watches
//	1. Load dataset into db



var datasetDefs 	= require('./dataset-defs')
var dataset 		= datasetDefs.dataset()

var fs 				= require('fs')
var async			= require('async')



var initApp = function() {
	async.waterfall([
		function(next) {
			dataset.getDatasetSize(next)
		},
		function(datasetSize, next) {
			console.log('datasetSize', datasetSize)
			require('./config').init(datasetSize)
			next()
		},
		function() {
			start()
		}
	])
}
	


var start = function() {
	var config 			= require('./config')
	console.log(config)
	var txnApp 			= require('./transactions/app')
	var sequenceApp		= require('./sequences/app')
	var clusterApp		= require('./clustering/app')
	var importApp		= require('./import/app')
	var transitionApp	= require('./transitions/app')


	var startTime = new Date().getTime()

	async.series([
		function(next) {
			importApp.makeImport(next)
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
		},
		function(next) {
			transitionApp.buildTransMatrix(next)
		}
	], 
	function(err, results){
		err && console.log(err)
		console.log('finished', datasetDefs.dataset())
		console.log('time: ', (new Date().getTime() - startTime) / 1000)
	})

}


	initApp()



	








