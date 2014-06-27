var async 		= require('async')
var sqlite3		= require('sqlite3').verbose()
var config		= require('../config')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var help		= require('../help')




var tableClusterItemCounts = function(done) {
	
	console.log('create table cluster_item_counts')
	
	async.waterfall([
		function(next) {
			db.run('drop table if exists cluster_item_counts', next)		
		},
		function(next) {
			var sql = 
				'create table cluster_item_counts 					\
				as 													\
				select 			cluster_id, 						\
								item_id, 							\
								count(item_id) as count 			\
				from 			txn_items as ti, 					\
								(select 		cluster_id, 		\
												txn_id 				\
								from 			cluster_members		\
								union 								\
								select  		centroid_txn_id  	\
								as 				txn_id, 			\
												cluster_id 	 		\
								from 			clusters) as uni 	\
				where 			ti.txn_id=uni.txn_id 				\
				group by 		cluster_id, item_id 				\
				order by 		cluster_id, count desc' 			

			db.run(sql, done)
		}
	])
}


var tableTxnItemRatings = function(done) {
	async.waterfall([
		function(next) {
			db.run('drop table if exists txn_item_ratings', next)		
		},
		function(next) {
			var sql = 
				'create table 	txn_item_ratings 		\
				as 										\
				select 			ti.txn_id, 				\
								ti.item_id, 			\
								f.rating 				\
				from 			txn_items as ti, 		\
								feedback as f, 			\
								txns as t 				\
				where 			ti.txn_id=t.txn_id 		\
				and 			t.user_id=f.user_id 	\
				and 			ti.item_id=f.item_id; '

			db.run(sql, done)
		}
	])
}

var tableClusterItemRatings = function(done) {
	async.waterfall([
		function(next) {
			db.run('drop table if exists cluster_item_ratings', next)		
		},
		function(next) {
			var sql = 
				'create table cluster_item_ratings 		\
				as select 	cic.item_id, 				\
							cic.count,					\
							cic.cluster_id, 			\
							cm.txn_id, 					\
							tir.rating 					\
														\
				from 		cluster_item_counts as cic, \
							cluster_members as cm, 		\
							txn_item_ratings as tir 	\
														\
				where 		cic.cluster_id=cm.cluster_id\
				and 		tir.txn_id=cm.txn_id 		\
				and         tir.item_id=cic.item_id' 	

			db.run(sql, done)
		}
	])
}




var tableItemClusterCounts = function(done) {
	async.waterfall([
		function(next) {
			db.run('drop table if exists item_cluster_counts', next)		
		},
		function(next) {
			var sql = 
				'create table 	item_cluster_counts 	\
				as 										\
				select   		item_id, 				\
								count(cluster_id) as count \
				from 			cluster_item_counts 	\
				group by 		item_id 				\
				order by 		item_id, cluster_id' 	

			db.run(sql, done)
		}
	])
}



var tableClusterItemTfidf = function(done) {
	console.log('tableClusterItemTfidf')
	async.waterfall([
		function(next) {

			db.run('drop table if exists cluster_item_tfidf', next)
		},
		function(next) {
			db.loadExtension(
				'/home/mephju/Dropbox/uni/seminarproject/project/daport/sqlite/extension-functions',
				next
			);
			next(null)
		},
		function(next) {
			var sql = 
				'create table cluster_item_tfidf 	 		\
				as 											\
				select 		cic.cluster_id, 				\
							cic.item_id, 					\
							cic.count 				as tf,	\
							icc.count 				as df,	\
							cc.N, 							\
							cic.count*log10(cc.N/icc.count)	as tfidf 	\
				from 		cluster_item_counts 	as cic, \
							item_cluster_counts 	as icc,	\
							item_counts 			as ic,	\
							(select 	count(*) 	as N 	\
							from 		clusters)   as cc 	\
				where 	cic.item_id=icc.item_id 			\
				and 	icc.item_id=ic.item_id;' 	

			db.run(sql, done)
		}
	])
}





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



var getCentroidRows = function(done) {
	console.log('getCentroidRows')
	async.waterfall([
		function(next) {
			db.all(
				'SELECT cluster_id, centroid_txn_id as txn_id, centroid_item_ids as item_ids \
				FROM clusters \
				ORDER BY cluster_id', next)		
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = help.textToNumArray(row['item_ids']) 
			})
			done(null, rows)
		}
	], done)	
}


var getClusterMembers = function(clusterId, done) {
	console.log('getClusterMembers for', clusterId)
	async.waterfall([
		function(next) {
			var	sql = 'select txn_id, item_ids from cluster_members where cluster_id=$1'
			
			db.all(sql, clusterId, next)
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = help.textToNumArray(row['item_ids']) 
			})
			done(null, rows)	
		}
	], done)
}


// var getClusterMembers2 = function(clusterId, done) {
// 	console.log('getClusterMembers32 for', clusterId)
// 	async.waterfall([
// 		function(next) {
// 			var sql = 
// 				'select distinct					\
// 							ic.item_id, ic.count 	\
// 				from 		cluster_members as cm, 	\
// 							txn_items as ti,  		\
// 							item_counts as ic 		\
// 				where 		cm.txn_id=ti.txn_id 	\
// 				and 		ti.item_id=ic.item_id 	\
// 				and 		cm.cluster_id=$1 		\
// 				order by 	ic.count desc 			\
// 				limit ' + config.N 			

// 			db.all(sql, clusterId, next)
// 		},
// 		function(rows, next) {
// 			rows.forEach(function(row) {
// 				row = row['item_id']
// 			})
// 			done(null, rows)	
// 		}
// 	], done)
// }

exports.tableClusterItemTfidf 	= tableClusterItemTfidf
exports.tableItemClusterCounts 	= tableItemClusterCounts
exports.tableTxnItemRatings 	= tableTxnItemRatings
exports.tableClusterItemRatings = tableClusterItemRatings 
exports.tableClusterItemCounts 	= tableClusterItemCounts
//exports.getClusterMembers2 	= getClusterMembers2
exports.getClusterMembers	= getClusterMembers
exports.getCentroidRows 	= getCentroidRows
exports.insertClusters 		= insertClusters