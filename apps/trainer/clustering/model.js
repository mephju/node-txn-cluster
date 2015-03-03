var sqlite3		= require('sqlite3').verbose()




function Model(dataset) {
	app.Model.call(this, dataset)
}
Model.prototype = Object.create(app.Model.prototype, {
	constructor: { value: Model	}
})
exports.Model = Model


Model.prototype.buildClustersFromDb = function(done) {
	log('buildClustersFromDb')

	var Cluster = require('./cluster')
	var ClusterGroup = require('./cluster-group')

	var clusters = null

	var model = this

	async.waterfall([

		function(next) {
			model.getCentroidRows(next) 
		},
		function(centroidRows) {
			console.log('buildClustersFromDb', centroidRows.length)			
			var clusters = centroidRows.map(function(centroidRow) {
				return new Cluster(centroidRow)
			})
			
			async.eachSeries(
				clusters,
				function(cluster, next) {
					var clusterId = cluster.centroidRow['cluster_id']
					model.getClusterMembers(clusterId, function(err, members) {
						cluster.members = members
						next(err, null)
					})	
				},
				function(err) {
					clusters = new ClusterGroup(clusters)		
					done(err, clusters)	
				}
			);
		
		}
	], done) 
}


Model.prototype.tableClusterItemCounts = function(done) {
	
	console.log('create table cluster_item_counts')
	
	var model = this
	
	async.waterfall([
		function(next) {
			model.db.run('drop table if exists cluster_item_counts', next)		
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

			model.db.run(sql, done)
		}
	], done)
}


Model.prototype.tableTxnItemRatings = function(done) {
	log('ClusterModel.tableTxnItemRatings')
	log(arguments)
	var model = this
	
	async.waterfall([
		function(next) {
			model.db.run('drop table if exists txn_item_ratings', next)		
		},
		function(next) {
			//var sql = 'create table 	txn_item_ratings as select 			ti.txn_id, 		ti.item_id, f.rating 		from 			txn_items as ti, feedback as f, 					txns as t 		where 			ti.txn_id=t.txn_id and 			t.user_id=f.user_idand 			ti.item_id=f.item_id'
			var sql = 'create table 	txn_item_ratings as select ' +
									'ti.txn_id,'  +
									'ti.item_id,' +
									'f.rating ' +
					'from 			txn_items as ti,' +
									'feedback as f,' +
									'txns as t ' +
					'where 			ti.txn_id=t.txn_id ' +
					'and 			t.user_id=f.user_id	' +
					'and 			ti.item_id=f.item_id'
			
			model.db.run(sql, done)
			//model.db.run('select * from txnsii limit 0', next)
		},
	], done)
}

Model.prototype.tableClusterItemRatings = function(done) {
	log('ClusterModel.tableClusterItemRatings')

	var model = this

	async.waterfall([
		function(next) {
			model.db.run('drop table if exists cluster_item_ratings', next)		
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

			model.db.run(sql, done)
		}
	])
}




Model.prototype.tableItemClusterCounts = function(done) {
	log('ClusterModel.tableItemClusterCounts')
	var model = this

	async.waterfall([
		function(next) {
			model.db.run('drop table if exists item_cluster_counts', next)		
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

			model.db.run(sql, done)
		}
	])
}



Model.prototype.tableClusterItemTfidf = function(done) {
	log('tableClusterItemTfidf')
	var model = this

	async.waterfall([
		function(next) {

			model.db.run('drop table if exists cluster_item_tfidf', next)
		},
		function(next) {
			model.db.loadExtension(
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

			model.db.run(sql, done)
		}
	])
}





Model.prototype.insertClusters = function(clusters, done) {
	log('ClusterModel.insertClusters', clusters.clusters.length)
	var model = this

	async.waterfall([
		function(next) {
			model.db.run('DROP TABLE IF EXISTS clusters', next)
		},
		function(next) {
			model.db.run('DROP TABLE IF EXISTS cluster_members', next)
		},
		function(next) {
			model.db.run(
				'CREATE TABLE clusters( \
				cluster_id INTEGER PRIMARY KEY, \
				centroid_txn_id INTEGER, \
				centroid_item_ids TEXT)',
				next
			);
		},
		function(next) {
			model.db.run(
				'CREATE TABLE cluster_members( \
				cluster_id INTEGER REFERENCES clusters, \
				txn_id INTEGER, \
				item_ids TEXT)', 
				next
			);
		},
		function(next) {
			model.db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			model.insClusters(clusters, next)
		},
		function(next) {
			model.db.run('END TRANSACTION', next)
		}
	], done)
}




Model.prototype.insClusters = function(clusters, done) {
	var stmt = null
	var model = this

	
	async.waterfall([
		function(next) {
			stmt = model.db.prepare('INSERT INTO clusters VALUES($1, $2, $3)', next)
		},
		function(next) {
			model.insClustersEach(stmt, clusters, next)
		}
	], done)
}


Model.prototype.insClustersEach = function(stmt, clusters, done) {
	var clusterId = 0
	var model = this

	async.eachSeries(
		clusters.clusters,
		function(cluster, next) {
			console.log('inserting cluster', clusterId)
			var row = cluster.centroidRow
			
			stmt.run( 
				[clusterId, row['txn_id'], row['item_ids'].toString()], 
				function(err) {
					model.insClusterMembers(cluster, clusterId, next)
					clusterId++
				}
			);	
		},
		done
	);
}


Model.prototype.insClusterMembers = function(cluster, clusterId, done) {
	var stmt = null
	var model = this

	async.waterfall([
		function(next) {
			stmt = model.db.prepare(
				'INSERT INTO cluster_members VALUES($1, $2, $3)', next
			);
		},
		function(next) {
			model.insClusterMembersEach(stmt, cluster.members, clusterId, next)
		}
	], done)
}


Model.prototype.insClusterMembersEach = function(stmt, members, clusterId, done) {
	var model = this
	async.eachSeries(
		members,
		function(member, next) {
			stmt.run([clusterId, member['txn_id'], member['item_ids'].toString()], next)
		},
		done
	);
}



Model.prototype.getCentroidRows = function(done) {
	console.log('getCentroidRows')
	var model = this
	async.waterfall([
		function(next) {
			model.db.all(
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


Model.prototype.getClusterMembers = function(clusterId, done) {
	console.log('getClusterMembers for', clusterId)
	var model = this
	async.waterfall([
		function(next) {
			var	sql = 'select txn_id, item_ids from cluster_members where cluster_id=$1'
			
			model.db.all(sql, clusterId, next)
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = help.textToNumArray(row['item_ids']) 
			})
			done(null, rows)	
		}
	], done)
}



