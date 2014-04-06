

//db.run('sql', function(err, lastIdWhenInsert, changesWhenUpdateOrDelete))

//1. Insert artist and song into last_fm_items table if not yet inserted
//2. Get the item_id of that record
//3. Insert user, timestamp item_id into last_fm table
//
var sqlite3 	= require('sqlite3').verbose();
var dataset 	= require('../dataset-defs').dataset()
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
			db.run('DROP TABLE last_fm_items', next)
		},
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




var itemIdStore = {}
exports.insertLfmItem = function(record, callback) {
	var bindParams = [ record[3], record[5] ]
	var itemId = itemIdStore[bindParams.toString()]

	//console.log('itemidstore', itemId)
	
	if(itemId) {
		callback(null, itemId)
	} else {
		async.waterfall([
			function(next) {
				insertLastFmItem.run(bindParams, function(err) {
					next(err, this.lastID);
				});
			},
			function(itemId, next) {
				itemIdStore[bindParams.toString()] = itemId
				callback(null, itemId)
			}
		], 
		callback);
	} 
}