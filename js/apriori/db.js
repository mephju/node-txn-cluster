var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async 		= require('async')
var config		= require('../config')
var help 		= require('../help')
var _ 			= require('lodash')


var getFrequentItemIds = function(support, done) {
	console.log('getFrequentItemIds')
	async.waterfall([
		function(next) {
			db.all(
				'select item_id, count from item_counts where count>$1',
				support,
				next
			);
		},
		function(rows, next) {
			console.log('getFrequentItemIds ', rows.length)
			done(null, rows)
		}
	], done)
}


//returns set transactions from database. 
var getTxnsAsSets = function(done) {
	console.log('getTxnsAsSets')
	async.waterfall([
		function(next) {
			db.all('select item_ids from txn_item_groups', next);
		},
		function(rows, next) {
			rows.forEach(function(row, i) {
				rows[i] = help.textToNumArray(row['item_ids'])
				rows[i] = help.toItemset(rows[i])
			})
			console.log('getTxnsAsSets', rows.length)
			done(null, rows)
		}
	], done)
}







exports.getFrequentItemIds 	= getFrequentItemIds
exports.getTxnsAsSets 		= getTxnsAsSets