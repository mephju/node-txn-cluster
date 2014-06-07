var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var help 		= require('../help')


var insertTransMatrix = function(transMatrix, callback) {
	console.log('insertTransMatrix', transMatrix.length)
	async.series([
		function(next) {
			db.run('DROP TABLE IF EXISTS transition;', next)
		},
		function(next) {
			db.run('CREATE TABLE IF NOT EXISTS transition(cluster_id INTEGER, matrix_row TEXT, row_sum INTEGER);', next)
		},
		function(next) {
			db.run('BEGIN TRANSACTION;', next)
		},
		function(next) {

			transMatrix.forEach(function(matrixRow, i) {
				db.run(
					'INSERT INTO transition(cluster_id, matrix_row, row_sum) VALUES(?, ?, ?)', 
					[i, JSON.stringify(matrixRow), help.arraySum(matrixRow)]
				);
				
			})
			next(null)
		},
		function(next) {
			db.run('END TRANSACTION;', next)
		},
	], function(err) {
		if(err) {
			console.log('insertTransMatrix', 'error')
		}
		callback(err)
	})
}

var removeNoTransClusters = function(done) {
	console.log('remove no trans clusters')
	async.waterfall([
		function(next) {
			db.all('SELECT rowid FROM transition WHERE row_sum=0', next)
		},
		function(rows, next) {
			var centroidIds = rows.map(function(row) {
				return row['rowid']
			}).toString()

			console.log('delete no trans clusters', centroidIds)
			async.waterfall([
				function(next) {
					db.run(
						'DELETE FROM transition WHERE row_sum=0',
						next
					);
				},
				function(next) {
					db.run(
						'DELETE FROM clusters WHERE cluster_id IN ($1)',
						centroidIds,
						next
					);
				},
				function(next) {
					db.run(
						'DELETE FROM cluster_members WHERE cluster_id IN ($1)',
						centroidIds,
						next
					);		
				}
			], next)	
		}
	], done)


}

var getTransMatrix = function(callback) {
	async.waterfall([
		function(next) {
			db.all('SELECT matrix_row FROM transition', next)
		},
		function(rows, next) {
			console.log('getTransMatrix', rows.length)
			var matrix = rows.map(function(row) {
				return JSON.parse(row['matrix_row'])
			})
			console.log('getTransMatrix', matrix)
			callback(null, matrix)
		},
	], callback)
}

exports.removeNoTransClusters = removeNoTransClusters
exports.getTransMatrix = getTransMatrix
exports.insertTransMatrix = insertTransMatrix