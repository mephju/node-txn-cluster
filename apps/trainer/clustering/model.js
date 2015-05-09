var Cluster = require('./cluster')
var ClusterGroup = require('./cluster-group')
var Distance  = require('../similarity').Distance
var DistanceModel = require('../../distances/DistanceModel')


function Model(dataset) {
	app.Model.call(this, dataset)

	log('Model', dataset.name)
	
	this.table = {
		clusters: 			this.dataset.prefixTableName('clusters'),
		clusterMembers: 	this.dataset.prefixTableName('cluster_members'),
		clusterItemCounts: 	this.dataset.prefixTableName('cluster_item_counts'),
		clusterItemRatings: this.dataset.prefixTableName('cluster_item_ratings'),
		itemClusterCounts: 	this.dataset.prefixTableName('item_cluster_counts'),
		clusterItemTfidf: 	this.dataset.prefixTableName('cluster_item_tfidf'),
	}

	this.stmt = {}

	log.yellow('clustermodel', this.table)
}
Model.prototype = Object.create(app.Model.prototype, {
	constructor: { value: Model	}
})
module.exports =  Model







Model.prototype.buildClustersFromDb = function(done) {
	log('buildClustersFromDb')

	var model = this

	async.wfall([
		function(next) {
			this.getCentroidRows(next) 
		},
		function(centroidRows, next) {
			log('buildClustersFromDb centroidRows', centroidRows.length)							
			model._createClusterGroup(centroidRows, done)
		}
	], this, done) 
}

Model.prototype._createClusterGroup = function(centroidRows, done) {

	log('_createClusterGroup', centroidRows.length)
	
	var distanceMeasure 	= new Distance(this.dataset)
	var distanceModel 		= new DistanceModel(this.dataset)
	var clusters 			= new ClusterGroup(this.dataset)	

	var model = this

	async.eachChain(
		centroidRows,
		function(centroidRow, next) {
			log.write('c')
			var clusterId = centroidRow['cluster_id']
			this.centroidRow = centroidRow
			model.getClusterMembers(clusterId, next)
		},
		function(members, next) {
			var cluster = new Cluster(this.centroidRow, distanceMeasure, distanceModel) 
			cluster.members = members
			clusters.addCluster(cluster)
			cluster.init(next)
		},
		function(next) {
			next(null)
		},
		function(err) {
			log(clusters.clusters.length)
			done(err, clusters)
		}
	);
}






Model.prototype.insertClusters = function(clusters, done) {
	log('ClusterModel.insertClusters', clusters.clusters.length)

	async.wfall([
		function(next) {
			this.db.run('DROP TABLE IF EXISTS ' + this.table.clusters, next)
		},
		function(next) {
			this.db.run('DROP TABLE IF EXISTS ' + this.table.clusterMembers, next)
		},
		function(next) {
			this.db.run(
				'CREATE TABLE ' + this.table.clusters + '( \
				cluster_id INTEGER PRIMARY KEY, \
				centroid_txn_id INTEGER, \
				centroid_item_ids TEXT)',
				next
			);
		},
		function(next) {
			this.db.run(
				'CREATE TABLE ' + this.table.clusterMembers + '( \
				cluster_id INTEGER REFERENCES ' + this.table.clusters + ', \
				txn_id INTEGER, \
				item_ids TEXT)', 
				next
			);
		},
		function(next) {
			this.stmt.insertCluster = 			this.db.prepare('INSERT INTO ' + this.table.clusters + ' VALUES($1, $2, $3)')
			this.stmt.insertClusterMembers = 	this.db.prepare('INSERT INTO ' + this.table.clusterMembers + ' VALUES($1, $2, $3)', next)
		},
		function(next) {
			this.db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			this._performInserts(clusters, next)
		},
		function(next) {
			this.db.run('END TRANSACTION', next)
		}
	], this, done)
}





Model.prototype._performInserts = function(clusters, done) {

	log('_performInserts')
	
	var model = this
	var cluster = null
	var clusterId = 0

	async.eachChain(
		clusters.clusters,
		function(_cluster, next) {
			cluster = _cluster
			log('inserting cluster', clusterId)
			var row = cluster.centroidRow
			
			model.stmt.insertCluster.run( 
				[clusterId, row['txn_id'], row['item_ids'].toString()], 
				next
			);
		},
		function(next) {
			model.insClusterMembersEach(cluster.members, clusterId, next)
		},
		function(next) {
			log('cluster', clusterId, 'inserted')
			clusterId++
			next()
		},
		done
	);
}




// Model.prototype.insClusterMembers = function(cluster, clusterId, done) {
// 	var stmt = null
// 	var model = this

// 	async.waterfall([
		
// 	], done)
// }


Model.prototype.insClusterMembersEach = function(members, clusterId, done) {
	var model = this
	async.eachSeries(
		members,
		function(member, next) {
			model.stmt.insertClusterMembers.run(
				[clusterId, member['txn_id'], member['item_ids'].toString()], 
				next
			);
		},
		done
	);
}














Model.prototype.tableClusterItemCounts = function(done) {
	
	console.log('create table cluster_item_counts')
	
	async.wfall([
		function(next) {
			this.db.run('drop table if exists ' + this.table.clusterItemCounts, next)		
		},
		function(next) {
			var sql = 
				'create table ' + this.table.clusterItemCounts +   '\
				as 													\
				select 			cluster_id, 						\
								item_id, 							\
								count(item_id) as count 			\
				from 			txn_items as ti, 					\
								(select 		cluster_id, 		\
												txn_id 				\
								from 	' + this.table.clusterMembers + ' \
								union 								\
								select  		centroid_txn_id  	\
								as 				txn_id, 			\
												cluster_id 	 		\
								from 	' + this.table.clusters + ' ) as uni 	\
				where 			ti.txn_id=uni.txn_id 				\
				group by 		cluster_id, item_id 				\
				order by 		cluster_id, count desc' 			

			this.db.run(sql, done)
		}
	], this, done)
}


Model.prototype.tableTxnItemRatings = function(done) {
	log('ClusterModel.tableTxnItemRatings')

	if(this.dataset.name.indexOf('last') != -1) {
		return done()
	}
	
	async.wfall([
		function(next) {
			this.db.run('drop table if exists txn_item_ratings', next)		
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
					'and 			ti.item_id=f.item_id '
			var sql = 'create table txn_item_ratings as select ti.txn_id,ti.item_id,f.rating from txn_items as ti,feedback as f,txns as t where ti.txn_id=t.txn_id and t.user_id=f.user_id and ti.item_id=f.item_id'

			this.db.run(sql, done)
			//model.db.run('select * from txnsii limit 0', next)
		},
	], this, done)
}

Model.prototype.tableClusterItemRatings = function(done) {
	log('ClusterModel.tableClusterItemRatings')

	if(this.dataset.name.indexOf('last') != -1) {
		return done()
	}


	async.wfall([
		function(next) {
			this.db.run('drop table if exists ' + this.table.clusterItemRatings, next)		
		},
		function(next) {
			var sql = 
				'create table ' + this.table.clusterItemRatings+ 		   '\
				as select 	cic.item_id, 				\
							cic.count,					\
							cic.cluster_id, 			\
							cm.txn_id, 					\
							tir.rating 					\
														\
				from ' 		+ this.table.clusterItemCounts 	+ ' as cic, '
							+ this.table.clusterMembers  	+ ' as cm, \
							txn_item_ratings as tir 	\
				where 		cic.cluster_id=cm.cluster_id\
				and 		tir.txn_id=cm.txn_id 		\
				and         tir.item_id=cic.item_id'	

			this.db.run(sql, done)
		}
	], this, done)
}




Model.prototype.tableItemClusterCounts = function(done) {
	log('ClusterModel.tableItemClusterCounts')

	async.wfall([
		function(next) {
			this.db.run('drop table if exists ' + this.table.itemClusterCounts, next)		
		},
		function(next) {
			var sql = 
				'create table ' + this.table.itemClusterCounts + ' \
				as 										\
				select   		item_id, 				\
								count(cluster_id) as count \
				from ' 			+ this.table.clusterItemCounts + ' \
				group by 		item_id 				\
				order by 		item_id, cluster_id' 	

			this.db.run(sql, done)
		}
	], this, done)
}



Model.prototype.tableClusterItemTfidf = function(done) {
	log('ClusterModel.tableClusterItemTfidf')

	async.wfall([
		function(next) {
			this.db.run('drop table if exists ' + this.table.clusterItemTfidf, next)
		},
		function(next) {
			this.db.loadExtension(
				__dirname + '/../../../sqlite/extension-functions',
				next
			);
		},
		function(next) {
			var sql = 
				'create table ' + this.table.clusterItemTfidf + '\
				as 											\
				select 		cic.cluster_id, 				\
							cic.item_id, 					\
							cic.count 				as tf,	\
							icc.count 				as df,	\
							cc.N, 							\
							cic.count*log10(cc.N/icc.count)	as tfidf 	\
				from ' 		+ this.table.clusterItemCounts + ' as cic, '
							+ this.table.itemClusterCounts + ' as icc,	\
							item_counts 			as ic,	\
							(select 	count(*) 	as N 	\
							from '		+ this.table.clusters + ')   as cc 	\
				where 	cic.item_id=icc.item_id 			\
				and 	icc.item_id=ic.item_id;' 	

			this.db.run(sql, done)
		}
	], this, done)
}








Model.prototype.getCentroidRows = function(done) {
	console.log('getCentroidRows', this.dataset.name, this.dataset.config.DISTANCE_MEASURE)
	
	async.wfall([
		function(next) {
			this.db.all(
				'SELECT cluster_id, centroid_txn_id as txn_id, centroid_item_ids as item_ids \
				FROM ' + this.table.clusters +  ' \
				ORDER BY cluster_id', next)		
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = help.textToNumArray(row['item_ids']) 
			})
			done(null, rows)
		}
	], this, done)	
}


Model.prototype.getClusterMembers = function(clusterId, done) {
	console.log('getClusterMembers for', clusterId)

	async.wfall([
		function(next) {
			var	sql = 'select txn_id, item_ids from ' + this.table.clusterMembers + ' where cluster_id=$1'
			this.db.all(sql, clusterId, next)
		},
		function(rows, next) {
			rows.forEach(function(row) {
				row['item_ids'] = help.textToNumArray(row['item_ids']) 
			})
			done(null, rows)	
		}
	], this, done)
}



