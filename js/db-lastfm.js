

//db.run('sql', function(err, lastIdWhenInsert, changesWhenUpdateOrDelete))

//1. Insert artist and song into last_fm_items table if not yet inserted
//2. Get the item_id of that record
//3. Insert user, timestamp item_id into last_fm table
//
var sqlite3 	= require('sqlite3').verbose();
var dataset 	= require('./dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var async 		= require('async')


var createLastFmItemTable = 
	'CREATE TABLE IF NOT EXISTS last_fm_items (' + 
	'item_id		INTEGER PRIMARY KEY AUTOINCREMENT,' +
	'artist 		TEXT NOT NULL, ' + 
	'song 			TEXT NOT NULL, ' +
	'UNIQUE(artist, song) )'


var insertLastFmItem 		= null; 
var getLastFmItemId 		= null;

exports.init = function(db, callback) {
	async.series([
		function(next) {
			db.run(createLastFmItemTable, next)
		},
		function(next) {
			insertLastFmItem = db.prepare('INSERT INTO last_fm_items(artist, song) VALUES(?, ?)', next)
		},
		function(next) {
			getLastFmItemId = db.prepare('SELECT item_id FROM last_fm_items WHERE artist=? AND song=?', next)
		},
	],callback)
}


var insItems = function(records, callback) {

	async.eachSeries(
		records,
		function(record, next) {
			var bindParams = [record[3], record[5]]
			insertLastFmItem.run(bindParams, function(err) {
				console.log('insItems', this.lastID)
				next(null)
			})
		},
		function(err) {
			console.log('dblastfm.insItems', err)
			callback(err)
		}
	);
}



var updateItemIds = function(recs, newRecords, callback) {
	async.eachSeries(
		recs,
		function(record, next) {
			updateId(record, newRecords, next)
		},
		function(err) {
			callback(err, newRecords)
		}
	);
}


var updateId = function(record, newRecords, callback) {
	var bindParams = [ record[3], record[5] ]

	async.waterfall([
		function(next) {
			console.log('find', bindParams)
			getLastFmItemId.get(bindParams, next)
		},
		function(row, next) {
			if(!next && row) {
				next = row
			} else {
				console.log(row)
				var itemId = row['item_id']
				newRecords.push([record[0], itemId, null, new Date(record[1]).getTime()/1000])
			}
			next(null)
				
		}
	], next);
}


exports.insertRows = function(records, callback) {

	async.waterfall([
		function(next) {
			insItems(records.slice(0), next)
		},
		function(updatedRecords, next) {
			callback(updatedRecords)
		}
	])
}