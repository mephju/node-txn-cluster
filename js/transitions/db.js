var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')


var insertTransMatrix = function(transMatrix, callback) {
	async.series([
		function(next) {
			db.run('DROP TABLE IF EXISTS transition;', next)
		},
		function(next) {
			db.run('CREATE TABLE IF NOT EXISTS transition(matrix TEXT);', next)
		},
		function(next) {
			db.run('INSERT INTO transition(matrix) VALUES(?)', JSON.stringify(transMatrix), next)
		}
	], function(err) {
		callback(err)
	})
}


exports.insertTransMatrix = insertTransMatrix