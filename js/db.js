var sqlite3 	= require('sqlite3').verbose();
var dataset 	= require('./dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var dbLastFm 	= require('./db-lastfm')
var sql 		= require('./sql')
var async		= require('async')


exports.db = db







var prepare = exports.prepare = function(dataset, callback) {

	db.serialize()
		
	console.log('preparing feedback tables for ' + dataset.dbTable)

	var table = dataset.dbTable

	async.series([
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
			db.run('DELETE FROM feedback', next)
		}
	], 
	function(err) {
		
		if(err) {
			err.where = 'db.js'
		} else {
			console.log('prepared')
		}
		callback(err)
	})
	
	
}



//TODO Add callback here
var insertItem = function(table, record, callback) {
	db.run(
		'INSERT INTO feedback VALUES(?, ?, ?)', 
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
				dbLastFm.insertRows(table, records.slice(0), function(newRecords) {
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


