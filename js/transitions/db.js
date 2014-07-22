var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var help 		= require('../help')


var insertTransMatrix = function(transMatrix, callback) {
	console.log('insertTransMatrix', transMatrix.length)
	insertMatrix('trans_matrix', transMatrix, callback)
}







var getTransMatrix = function(callback) {
	console.log('getTransMatrix')
	async.waterfall([
		function(next) {
			db.all('SELECT matrix_row FROM trans_matrix ORDER BY cluster_id', next)
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



var insertMatrix = function(tableName, matrix, callback) {
	console.log('insertMatrix', matrix.length)
	async.series([
		function(next) {
			db.run('DROP TABLE IF EXISTS ' + tableName, next)
		},
		function(next) {
			db.run('CREATE TABLE IF NOT EXISTS ' + tableName + '(cluster_id INTEGER, matrix_row TEXT, row_sum INTEGER);', next)
		},
		function(next) {
			db.run('BEGIN TRANSACTION;', next)
		},
		function(next) {

			matrix.forEach(function(matrixRow, i) {
				db.run(
					'INSERT INTO ' + tableName + '(cluster_id, matrix_row, row_sum) VALUES(?, ?, ?)', 
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
			console.log('insertMatrix', 'error')
		}
		callback(err)
	})
}


var init = function(done) {
	async.waterfall([
		function(next) {
			db.run('drop table if exists transitions', next)
		},
		function(next) {
			db.run('create table transitions(txn_id integer, sequence text)', next)
			
		}
	], done);
}

var insertTransitions = function(manyTransitions, done) {
	console.log('insertTransitions', manyTransitions.length)
	async.waterfall([
		function(next) {
			db.run('begin transaction', next)
		},
		function(next) {
			async.eachSeries(
				manyTransitions,
				function(tsns, next) {
					//console.log(tsns.txn_id, tsns.seq)
					db.run(
						'insert into transitions values($1, $2)', 
						tsns['txn_id'],
						tsns.seq.toString(), 
						next
					);
				},
				next
			);
		},
		function(next) {
			console.log('done')
			db.run('end transaction', done)
		}
		
	], done);
}



var getTransitions = function(done) {
	console.log('getTransitions')
	async.waterfall([
		function(next) {
			db.all('select * from transitions', next)
		},
		function(rows, next) {
			rows.forEach(function(item, i) {
				rows[i] = item['sequence'].split(',').map(function(string) {
					return parseInt(string)
				})
			})
			done(null, rows)
		}
	], done);
}



// var removeNoTransClusters = function(transMatrix, done) {

// 	//console.log(transMatrix)

// 	var centroidIds = pruneMatrix(transMatrix)
// 	console.log('remove no trans clusters')

// 	if(centroidIds.length === 0) { 
// 		console.log('0 clusters to remove')
// 		return done(null, transMatrix)
// 	}

// 	console.log('going to remove clusters', centroidIds)

// 	async.eachSeries(
// 		centroidIds,
// 		function(id, next) {
// 			db.run('DELETE FROM clusters WHERE cluster_id=$1', id)
// 			db.run('DELETE FROM cluster_members WHERE cluster_id=$1', id, next)
// 		},
// 		function(err) {
// 			done(err, transMatrix)
// 		}
// 	);
	
// }
// 


exports.getTransitions = getTransitions
exports.init = init
exports.insertTransitions = insertTransitions

exports.getTransMatrix = getTransMatrix
exports.insertTransMatrix = insertTransMatrix
exports.insertMatrix = insertMatrix