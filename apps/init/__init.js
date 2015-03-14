global.log 				= require('./log')


global.help 			= require('./help')
global.colors 			= require('./colors')

global._ 				= require('lodash')
global.async 			= require('async')
global.async.eachChain 	= require('./asy').eachChain
global.async.forloop 	= require('./asy').forloop
global.async.wfall 		= require('./asy').wfall

global.datasets 		= require('./datasets')


global.app = {
	Config: require('./config'),
	Model: require('./super-model').Model
	
}

log.cyan(app)



//global.config 	= require('./config')



