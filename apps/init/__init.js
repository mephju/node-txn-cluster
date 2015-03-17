global.log 				= require('./log')


global.help 			= require('./help')
global.colors 			= require('./colors')

global._ 				= require('lodash')
global.async 			= require('async')
global.async.eachChain 	= require('./asy').eachChain
global.async.forloop 	= require('./asy').forloop
global.async.wfall 		= require('./asy').wfall



global.app = {
	datasets: require('./datasets'),
	Config: require('./config'),
	Model: require('./super-model').Model
	
}



//global.config 	= require('./config')



