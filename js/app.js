//Transaction Builder
//Build transaction out of datasets containing user feedback such as ratings or watches
//	1. Load dataset into db



var datasetDefs 	= require('./dataset-defs')
var dataset 		= datasetDefs.dataset()
var fs 				= require('fs')
var async			= require('async')



var initApp = function() {
	console.log('initApp')
	async.waterfall([
		function(next) {
			dataset.getDatasetSize(next)
		},
		function(datasetSize, next) {
			console.log('datasetSize', datasetSize)
			require('./config').init(datasetSize)
			start()
		},
	], function(err) {
		if(err) {
			console.log('initApp failed')
		}
	})
}
	


var start = function() {
	var config 			= require('./config')
	console.log(config)
	var txnApp 			= require('./transactions/app')
	var clusterApp		= require('./clustering2/index')
	var clusterGroupModule = require('./clustering2/cluster-group')
	var importApp		= require('./import/app')
	var transitionApp	= require('./transitions/app')


	var startTime = new Date().getTime()

	async.waterfall([
		function(next) {
			importApp.makeImport(next)
		},
		function(next) {
			console.log('build txns')
			txnApp.buildTxns(next)
		}, 
		function(next) {
			clusterApp.start(next)
		},
		// function(next) {
		// 	next(null, '')
		// },
		function(clusterGroup, next) {
			// read clusters from db again so we can remove 
			// the previous step if we want to skip it
			clusterGroup = null 
			clusterGroupModule.buildFromDb(next)
		},
		function(clusterGroup, next) {
			console.log('this is clusterGroup')
			//console.log(clusterGroup)
			transitionApp.buildTransMatrix(clusterGroup, next)	
		},
		function(next) {
			console.log('done building transition matrix')
			next(null)
		}

	], 
	function(err){
		err && console.log(err)
		console.log('finished', datasetDefs.dataset())
		console.log('time: ', (new Date().getTime() - startTime) / 1000)
	})

}





	initApp()



	








