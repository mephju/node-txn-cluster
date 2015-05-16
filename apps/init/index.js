if(!process.env.BASE_PATH) {
	process.env.BASE_PATH = '/stuff/datamining/'
}

global.log 				= require('./log')


global.help 			= require('./help')
global.colors 			= require('./colors')

global._ 				= require('lodash')
global.async 			= require('async')
global.async.eachChain 	= require('./asy').eachChain
global.async.forloop 	= require('./asy').forloop
global.async.wfall 		= require('./asy').wfall
global.DEV 				= process.env.BASE_PATH.indexOf('/stuff/datamining') !== -1



global.app = {
	Config: 	require('./Config'),
	Model: 		require('./Model'),
	EvalConfig: require('./EvalConfig'),
	comboCall: 	require('./combo-call').comboCall,
}

app.datasets = require('./datasets')

app.models = {
	TxnModel: 			require('../session-builder/transactions/model'),
	ClusterModel: 		require('../trainer/clustering/model'),		
	EvalModel: 			require('../evaluator/EvalModel'),
	TransitionModel:  	require('../transition-builder/TransitionModel'),
}

app.config = new app.Config({})





log('app init done')







//global.config 	= require('./config')



