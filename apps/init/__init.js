global.log 		= require('./log')
global.Config	= require('./config')
global.config 	= new Config()

global.help 	= require('./help')
global.colors 	= require('./colors')

global._ 		= require('lodash')
global.async 	= require('async')

global.app = {
	Model: require('./super-model').Model
	
}

log.cyan(app)



//global.config 	= require('./config')



