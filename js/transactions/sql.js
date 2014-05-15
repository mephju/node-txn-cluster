var util = require('util')
var config = require('../config')
exports.createTxnsStmt = function() {
	return 'CREATE TABLE IF NOT EXISTS txns (' +
		'txn_id			INTEGER PRIMARY KEY AUTOINCREMENT,' +
		'user_id		TEXT NOT NULL)'
}


exports.createTxnItemsStmt = function() {
	return 'CREATE TABLE IF NOT EXISTS txn_items (' +
		'txn_id					INTEGER NOT NULL, ' +
		'item_id				INTEGER NOT NULL,' +
		'FOREIGN KEY(txn_id) 	REFERENCES txns(txn_id), ' +
		'FOREIGN KEY(item_id) 	REFERENCES feedback(item_id))'
}

exports.getUserIdsStmt = function() {
	return 'SELECT DISTINCT user_id FROM feedback ORDER BY user_id' 
}

exports.insertTxnStmt = function() {
	return 'INSERT INTO txns(user_id) VALUES(?)'
}

exports.insertTxnItemStmt = function() {
	return 'INSERT INTO txn_items(txn_id, item_id) VALUES(?, ?)'
}

exports.createIndexStmt = function() {
	return 'CREATE INDEX IF NOT EXISTS txn_items_idx ON txn_items(item_id)'
}

// exports.createFeedbackStmt = function() {
// 	return 'CREATE TABLE IF NOT EXISTS feedback(' + 
// 		'user_id 		INTEGER NOT NULL, ' + 
// 		'item_id 		INTEGER NOT NULL, ' +
// 		'timestamp 		TIMESTAMP NOT NULL)' 
// }
exports.getTxnItemsStmt = function() {
	return 'SELECT item_id FROM txn_items WHERE txn_id=?'
}



exports.getTxnIdsStmt = function() {
	var stmt = util.format(
		'SELECT txn_id, count(txn_id) as c FROM txn_items GROUP BY txn_id HAVING c>=%d',
		config.MIN_SEQUENCE_SIZE
	);
	return stmt
}

exports.getAllTxnIds = function(limit) {
	var stmt = 'SELECT txn_id FROM txns ORDER BY txn_id LIMIT ' + limit
	return stmt
}

exports.createTableTxnItemGroups = 
	'CREATE TABLE IF NOT EXISTS	txn_item_groups AS ' +
	'SELECT 		txn_id, group_concat(item_id) as item_ids ' +
	'FROM 			txn_items ' +
	'GROUP BY 		txn_id ' +
	'ORDER BY  		rowid' 