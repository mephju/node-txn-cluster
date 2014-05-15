var async 		= require('async')
var sqlite3		= require('sqlite3').verbose()
var config		= require('../config')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())




var insertClusters = function(clusters, done) {
	async.waterfall([
		function(next) {
			db.run('DROP TABLE IF EXISTS clusters')
			db.run('DROP TABLE IF EXISTS cluster_members', next)
		},
		function(next) {
			db.run(
				'CREATE TABLE clusters( \
				cluster_id INTEGER PRIMARY KEY, \
				centroid_txn_id INTEGER, \
				centroid_item_ids TEXT)'
			);
			db.run(
				'CREATE TABLE cluster_members( \
				cluster_id INTEGER REFERENCES clusters, \
				txn_id INTEGER, \
				item_ids TEXT)', 
				next
			);
		},
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			insClusters(clusters, next)
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	], done)
}




var insClusters = function(clusters, done) {
	var stmt = null
	
	async.waterfall([
		function(next) {
			stmt = db.prepare('INSERT INTO clusters VALUES($1, $2, $3)', next)
		},
		function(next) {
			insClustersEach(stmt, clusters, next)
		}
	], done)
}


var insClustersEach = function(stmt, clusters, done) {
	var clusterId = 0
	async.eachSeries(
		clusters.clusters,
		function(cluster, next) {
			console.log('inserting cluster', clusterId)
			var row = cluster.centroidRow
			
			stmt.run( 
				[clusterId, row['txn_id'], row['item_ids'].toString()], 
				function(err) {
					insClusterMembers(cluster, clusterId, next)
					clusterId++
				}
			);	
		},
		done
	);
}


var insClusterMembers = function(cluster, clusterId, done) {
	var stmt = null

	async.waterfall([
		function(next) {
			stmt = db.prepare(
				'INSERT INTO cluster_members VALUES($1, $2, $3)', next
			);
		},
		function(next) {
			insClusterMembersEach(stmt, cluster.members, clusterId, next)
		}
	], done)
}


var insClusterMembersEach = function(stmt, members, clusterId, done) {
	async.eachSeries(
		members,
		function(member, next) {
			stmt.run([clusterId, member['txn_id'], member['item_ids'].toString()], next)
		},
		done
	);
}



exports.insertClusters = insertClusters