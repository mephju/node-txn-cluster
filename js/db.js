var sqlite3		= require('sqlite3').verbose()
var dataset		= require('./dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async 		= require('async')
var config		= require('./config')


var getTableSize = function(table, callback) {
	console.log('getTableSize')
	async.waterfall([
		function(next) {
			db.get('SELECT count(*) as count FROM ' + table, next)
		},
		function(row, next) {
			console.log(row)
			callback(null, row.count)
		}
	], callback)
}

var getTrainingSetSize = function(done) {
	async.waterfall([
		function(next) {
			getTableSize('txns', next)
		},
		function(size, next) {
			var trainingSetSize = Math.floor(size*config.TRAINING_SET_SIZE)
			done(null, trainingSetSize)
		}
	], done)
}

exports.getTrainingSetSize = getTrainingSetSize
exports.getTableSize = getTableSize