var async 		= require('async')
var reader 		= require('./feedback-import')
var db 			= require('./db')
var datasetDefs	= require('../dataset-defs')

var makeImport = function(callback) {


	async.waterfall([
		function(next) {
			console.log('db.prepare')
			
			db.prepare(next)
		},
		function(next) {
			console.log('importSets')
			var dataset = datasetDefs.dataset()
			console.log('going to import ' + dataset.datasetPath)
			reader.import(dataset, next)
		}
	], callback);



			

}


exports.makeImport = makeImport