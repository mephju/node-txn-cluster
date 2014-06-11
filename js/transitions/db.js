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
				console.log('insertTransMatrix', i)
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

var pruneMatrix = function(transMatrix) {
	console.log('pruneMatrix')
	var pruned = []
	for (var i=0; i < transMatrix.length; i++) {
		var rowSum = transMatrix[i].reduce(function(l, r) {
			return l+r
		})	
		if(rowSum === 0) {
			pruned.push(i)
		}
	}

	if(pruned.length > 0) {
		pruned.reverse()
		pruned.forEach(function(index) {
			transMatrix.splice(index, 1)
			pruneColumn(index, transMatrix)
		})
		pruned = pruned.concat(pruneMatrix(transMatrix))
	}

	return pruned;
}

var pruneColumn = function(index, transMatrix) {
	for(var i=0; i<transMatrix.length; i++) {
		transMatrix[i].splice(index, 1)
	}
}



var removeNoTransClusters = function(transMatrix, done) {

	console.log(transMatrix)

	var centroidIds = pruneMatrix(transMatrix)
	console.log('remove no trans clusters')

	if(centroidIds.length === 0) { 
		console.log('0 clusters to remove')
		return done(null, transMatrix)
	}

	console.log('going to remove clusters', centroidIds)

	async.eachSeries(
		centroidIds,
		function(id, next) {
			db.run('DELETE FROM clusters WHERE cluster_id=$1', id)
			db.run('DELETE FROM cluster_members WHERE cluster_id=$1', id, next)
		},
		function(err) {
			done(err, transMatrix)
		}
	);
	
}

var getTransMatrix = function(callback) {
	console.log('getTransMatrix')
	async.waterfall([
		function(next) {
			db.all('SELECT matrix_row FROM transition ORDER BY cluster_id', next)
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