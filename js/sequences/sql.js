var util = require('util')
var config = require('../config')

var sequences = {}

sequences.makeCreateStmt = function() {
	return 'CREATE TABLE IF NOT EXISTS sequences(' + 
		'sequence TEXT PRIMARY KEY NOT NULL, ' +
		'count INTEGER NOT NULL)'
} 

sequences.makeDropStmt = function() {
	return 'DROP TABLE IF EXISTS sequences '
}

sequences.makeInsertStmt = function() {
	return 'INSERT OR IGNORE INTO sequences(sequence, count) VALUES($1, 0)'
}

sequences.makeUpdateStmt = function() {
	return 'UPDATE sequences SET count=count+$1 WHERE sequence=$2'
}
sequences.selectSequenceIdStmt = function() {
	return 'SELECT rowid as sequence_id FROM sequences WHERE sequence=$1'
}
sequences.getFrequent = function() {
	return util.format(
		'SELECT sequence FROM sequences WHERE count>%d ORDER BY rowid',
		config.MIN_SEQUENCE_FREQUENCY
	);	
}

// sequences.createFrequentSequencesStmt = function(count) {
// 	return util.format(
// 		'CREATE VIEW IF NOT EXISTS frequent_sequences ' +
// 		'AS ' +
// 		'SELECT 		rowid as sequence_id, sequence, count ' +
// 		'FROM 			sequences ' +
// 		'WHERE 			count>=%d ' +
// 		'ORDER BY    	sequence_id',
// 		count
// 	);
// }



exports.sequences = sequences

