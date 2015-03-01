var Feeder 		= require('./feeder').Feeder
var db 			= require('./db')


var makeImport = function(dataset, done) {


	async.waterfall([
		function(next) {
			log('db.prepare', dataset.name)
			db.prepare(dataset, next)
		},
		function(next) {
			log('going to import ' + dataset.filepath + 'into ' + dataset.dbPath)
			new Feeder(dataset).import(next)
		},
		function(next) {
			db.createFeedbackIdx(next)
		},
		function(next) {
			log('import app is finished')
			done()
		}
	], done);
}


exports.makeImport = makeImport