global.log 		= require('./log')
global.help 	= require('./help')
global.colors 	= require('./colors')
global.config 	= require('./config')
global._ 		= require('lodash')
global.async 	= require('async')

global.app = {
	Model: require('./super-model').Model
	
}

log.cyan(app)



//global.config 	= require('./config')



