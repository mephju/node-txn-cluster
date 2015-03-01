

// start this app with the following command
// node index.js datasetname recommendertype
// node index.js lastfm_small own-method

require('./init')
var datasetDefs 	= require('./dataset-defs')
var config 			= require('./config')

var file 			= process.argv[1]
var datasetName 	= process.argv[2]
var recommenderType	= process.argv[3]

// was this file was started from the command line?
// if so, check for given datasetname and initiate corresponding dataset
if(file === __filename && datasetName) { 
	datasetDefs.init(datasetName)
	if(recommenderType) {
		config.RECOMMENDER = recommenderType
	}
}
var dataset 		= datasetDefs.dataset()
var fs 				= require('fs')
var async			= require('async')
var evalApp			= require('./eval')
var clusterApp			= require('./clustering2/index')
var clusterGroupModule 	= require('./clustering2/cluster-group')

console.log(config)
var txnApp 				= require('./transactions/app')

var importApp			= require('./import/app')
var transitionApp		= require('./transitions/app')
var rootDb 				= require('./db')
var clusters	 		= null

var main = function() {
	
	

	var startTime = new Date().getTime()

	async.waterfall([
		// function(next) {
		// 	importApp.makeImport(next)
		// },
		function(next) {
			console.log('build txns')
			txnApp.buildTxns(next)
		},
		function(next) {
			rootDb.getTrainingSetSize(next)
		},
		function(trainingSetSize, next) {
			config.reconfigure(trainingSetSize)

			if(config.RECOMMENDER === 'own-method') {
				useOwnMethod(next)
			} else {
				next(null)
			}
		},
		function(next) {
			console.log('done preparing data')
			next(null)
		},
		function(next) {
			evalApp.start(next)
		}

	], 
	function(err){
		err && console.log(err)
		console.log('finished', datasetDefs.dataset())
		console.log('time: ', (new Date().getTime() - startTime) / 1000)
	})
}


var useOwnMethod = function(done) {
	async.waterfall([
		function(next) {
			clusterApp.start(next)
		},
		function(clusterGroup, next) {
			// read clusters from db again so we can remove 
			// the previous step if we want to skip it
			clusterGroup = null 
			clusterGroupModule.buildFromDb(next)
		},
		function(clusterGroup, next) {
			clusters = clusterGroup
			console.log('this is clusterGroup')
			//console.log(clusterGroup)
			transitionApp.buildTransitions(clusters, next)	
		},
		function(next) {
			transitionApp.buildMarkovChain(next)
		}
	], done)
}


main()




	








