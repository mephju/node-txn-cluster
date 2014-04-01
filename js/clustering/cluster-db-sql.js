var util = require('util')

exports.cluster = {
	drop: function() {
		return 'DROP TABLE IF EXISTS cluster'
	},
	create: function() {
		return "CREATE TABLE cluster (cluster_id INTEGER, txn_id INTEGER, clustered TEXT DEFAULT 'cosine', UNIQUE(cluster_id, txn_id))"
	}, 
	insert: function() {
		return 'INSERT INTO cluster(cluster_id, txn_id) VALUES($1, $2)'
	}
}

exports.centroid = {
	drop: function() {
		return 'DROP TABLE IF EXISTS centroid'
	},
	create: function() {
		return 'CREATE TABLE centroid (cluster_id INTEGER PRIMARY KEY, vector TEXT)'
	}, 
	insert: function() {
		return 'INSERT INTO centroid(cluster_id, vector) VALUES($1, $2)' 
	}
}