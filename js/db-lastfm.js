

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
			db.prepare('INSERT INTO last_fm_items(artist, song) VALUES(?, ?)', next)
		},
		function(next) {
			db.prepare('SELECT item_id FROM last_fm_items WHERE artist=? AND song=?', next)
		},
	],callback)
}


var insItems = function(recs, callback) {
	var record = recs.shift()
	if(record == null) {
		callback()
	} else {
		var bindParams = [record[3], record[5]]
		insertLastFmItem.run(bindParams, function(e) {
			insItems(recs, callback)
		})
	}
}



var updateItemIds = function(recs, newRecords, callback) {
	var record = recs.shift()
	if(record == null) {
		callback(newRecords)
	} else {
		var bindParams = [record[3], record[5]]
		getLastFmItemId.get(bindParams, function(e, row) {

			var itemId = row['item_id']
			newRecords.push([record[0], itemId, null, new Date(record[1]).getTime()/1000])
			updateItemIds(recs, newRecords, callback)
		})
	}
}



exports.insertRows = function(table, records, callback) {
	
	insItems(records.slice(0), function() {
		console.log('dbLastFm.insItems')
		updateItemIds(records.slice(0), [], function(updatedRecords) {
	
			callback(updatedRecords)
		})
	})
}