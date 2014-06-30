var sqlite3 	= require('sqlite3').verbose();
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var dbLastFm 	= require('./db-lastfm')
var sql 		= require('./sql')
var async		= require('async')


exports.db = db




var insertFeedbackStmt = null


var prepare = exports.prepare = function(callback) {

	
		
	console.log('preparing feedback tables  ')

	async.series([
		function(next) {
			db.serialize(next)
		},
		function(next) {
			if(dataset.dbTable.indexOf('last') !== -1) {
				dbLastFm.init(db, next)	
			} else {
				next(null)
			}
		},
		function(next) {
			db.run('drop table if exists feedback', next)
		},
		function(next) {
			console.log('createFeedbackStmt1')
			db.run(sql.createFeedbackStmt(), next)
		},
		function(next) {
			insertFeedbackStmt = db.prepare('INSERT INTO feedback VALUES(?, ?, ?, ?)', next)
		},
		function(next) {
			db.run('DELETE FROM feedback', next)
		},
		function(next) {
			db.run('PRAGMA journal_mode = OFF', next)
		}
	], 
	function(err) {
		
		if(err) {
			err.where = '/import/db.js'
		} else {
			console.log('prepared')
		}
		callback(err)
	})
	
	
}




var insertItem = function(record, callback) {
	insertFeedbackStmt.run([
		record[dataset.indices.userId], 
		record[dataset.indices.itemId], 
		record[dataset.indices.timestamp], 
		record[dataset.indices.rating]
	], //user, item, timestamp, rating
		callback
	);
}



var insertItems = function(records, callback) {

	async.eachSeries(
		records,
		function(record, next) {
			insertItem(record, next)
		},
		function(err) {
			callback(err)
		}
	);
}






exports.insert = function(records, callback) {
	
	var table = dataset.dbTable
	console.log('insert')
	

	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			if(table.indexOf('last_fm') === -1) {
				insertItems(records, next)
			} 
			else {
				insertLastFm(records, next)
			}
		},
		function(next) {
			console.log('inserted')
			db.run('END TRANSACTION', next)	
		}
	],
	callback);
}



var insertLastFm = function(records, callback) {

	async.eachSeries(
		records,
		function(record, next) {
			async.waterfall([
				function(next) {
					dbLastFm.insertLfmItem(record, next)
				},
				function(itemId, next) {
					var r = [ 
						record[dataset.indices.userId], 
						itemId, 
						null, 
						new Date(record[1]).getTime()/1000 
					]; 
					console.log(r)
					//console.log('insertLastFmItem', r, record)
					insertItem(r, next)
				}
			], next)
		},
		function(err) {
			console.log('insertLastFm.finished', err)
			callback(err)
		}
	);
		
}


