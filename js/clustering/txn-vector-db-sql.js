var util = require('util')


exports.table = {
	txnVector: {
		create: function() {
			return 	'CREATE TABLE IF NOT EXISTS txn_vector(' + 
					'txn_id INTEGER PRIMARY KEY NOT NULL, ' + 
					'vector TEXT NOT NULL)'
		},
		drop: function() {
			return 'DROP TABLE IF EXISTS txn_vector'
		},
		insert: function() {
			return 'INSERT INTO txn_vector(txn_id, vector) VALUES($1, $2)'
		},
		select: function() {
			return "SELECT txn_id, vector FROM txn_vector where vector!='[]'"
		},
		getTxnIds: function() {
			return "SELECT txn_id FROM txn_vector where vector!='[]'"
		},
		getNonVectorIds: "SELECT txn_id FROM txn_vector where vector='[]'",
		getTxnVector: function() {
			return "SELECT vector FROM txn_vector where txn_id=$1"
		},
		getManyTxnVectors: function() {
			return "SELECT vector FROM txn_vector where txn_id IN "
		}

	}
}