var sqlite3 	= require('sqlite3').verbose();
var dataset 	= require('./dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var dbLastFm 	= require('./db-lastfm')
var sql 		= require('./sql')
var async		= require('async')


exports.db = db




var insertFeedbackStmt = null


var prepare = exports.prepare = function(dataset, callback) {

	
		
	console.log('preparing feedback tables  ')

	async.series([
		function(next) {
			db.serialize(next)
		},
		function(next) {
			if(dataset.dbTable.indexOf('last') != -1) {
				dbLastFm.init(db, next)	
			} else {
				next(null)
			}
		},
		function(next) {
			console.log('createFeedbackStmt')
			db.run(sql.createFeedbackStmt(), next)
			
		},
		function(next) {
			insertFeedbackStmt = db.prepare('INSERT INTO feedback VALUES(?, ?, ?)', next)
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
			err.where = '/db.js'
		} else {
			console.log('prepared')
		}
		callback(err)
	})
	
	
}




var insertItem = function(table, record, callback) {
	insertFeedbackStmt.run(
		[record[0], record[1], record[3]], //user, item, timestamp 
		callback
	);
}



var insertItems = function(table, records, callback) {

	async.eachSeries(
		records,
		function(record, next) {
			insertItem(table, record, next)
		},
		function(err) {
			callback(err)
		}
	);
}






exports.insert = function(table, records, callback) {
	
	console.log('insert')
	

	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			if(table.indexOf('last_fm') === -1) {
				insertItems(table, records.slice(0), next)
			} 
			else {
				dbLastFm.insertRows(records, function(newRecords) {
					insertItems(table, newRecords, next)
				})
			}
		},
		function(next) {
			console.log('inserted')
			db.run('END TRANSACTION', next)	
		}
	],
	callback);
}


