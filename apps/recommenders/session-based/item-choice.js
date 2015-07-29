	
var sqlite3		= require('sqlite3').verbose()


function ItemChoice(dataset) {
	this.dataset = dataset
	this.config = dataset.config

	this.db = new sqlite3.Database(dataset.dbPath)
	this.memberStore = {}
	this.sql = null
	this.strategy = dataset.config.ITEM_CHOICE_STRATEGY

	this.makeSql()
	
	switch(this.strategy) {
		case 'tfTfidf':					this.sql = this.db.prepare(this.sqlWithTfTfidf);			break;
		case 'tfidf':					this.sql = this.db.prepare(this.sqlWithTfidf);			break;
		case 'bestItemsOfCluster':		this.sql = this.db.prepare(this.sqlBestItemsOfCluster);	break;
		case 'bestItemsOverall':		this.sql = this.db.prepare(this.sqlBestItemsOverall);		break
		case 'random': 					this.sql = this.db.prepare(this.sqlRandomItem);			break;
		case 'withRatings': 			
			this.sql = this.db.prepare(this.sqlWithRatings); 
			if(typeof dataset.indices.rating === 'undefined') {
				throw 	'ITEM_CHOICE_STRATEGY.withRatings cannot be applied to dataset without ratings'
			} 
			break
		default: 
			throw 'no item choice strategy chosen'
	}
}
module.exports = ItemChoice

ItemChoice.prototype.init = function(done) {

	async.wfall([
		function(next) {
			this.db.all('select distinct cluster_id from ' + this.dataset.prefixTableName('clusters') + ' order by cluster_id asc', next)
		},
		function(rows, next) {
			this.fetchMembers(rows, next)
		},
	], this, done)
}

ItemChoice.prototype.fetchMembers = function(clusters, done) {
	console.log('fetchMembers')
	
	var _this = this
	var clusterId = null

	async.eachChain(
		clusters,
		function(cluster, next) {
			log('fetching members for cluster', cluster['cluster_id'], _this.strategy)
			clusterId = cluster['cluster_id']			
			_this.sql.all(clusterId, next)
		},
		function(members, next) {
			members.forEach(function(member, i) {
				members[i] = member['item_id']
			})
			_this.memberStore[clusterId] = members
			//log('members', members)
			next()
		},
		done
	);
}



/**
 * Return the best items of cluster with clusterId.
 * Best as defined by the strategy this ItemChoice object is pursuing.
 *
 * TODO: Find out whether .slice() is needed.
 * It's not needed if returned array is not manipulated anyway.
 * 
 * @param  {[type]} n         [description]
 * @param  {[type]} clusterId [description]
 * @return {[type]}           [description]
 */

ItemChoice.prototype.getBestItems = function(numRecomms, clusterId) {
	return this.memberStore[clusterId].slice(0, numRecomms)
}

// ItemChoice.prototype.fetchMembersById = function(clusterId, done) {
// 	console.log('fetchMembersById', clusterId)
// 	var strategy = this
// 	async.waterfall([
		
// 	], done)
// }


/**
 * Get n random items from array. 
 * @param  {[type]} n     [description]
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
ItemChoice.prototype.getRandomItems = function(numRecomms, clusterId) {
	var members = this.memberStore[clusterId]

	return help.arrayRandomItems(numRecomms, members)
}




// var bestItemsOfCluster = 
// 	'select 	*, 							\
// 				count(ti.item_id) as count 	\
// 	from 		cluster_members as cm, 		\
// 				txn_items as ti 			\
// 	where 		cm.txn_id=ti.txn_id 		\
// 	and 		cm.cluster_id=$1 			\
// 	group by 	cm.cluster_id, ti.item_id 	\
// 	order by 	cluster_id ASC, count DESC  \
// 	limit ' 	+ config.N
// 	
ItemChoice.prototype.makeSql = function() {

	var table = {
		clusters: 			this.dataset.prefixTableName('clusters'),
		clusterMembers: 	this.dataset.prefixTableName('cluster_members'),
		clusterItemCounts: 	this.dataset.prefixTableName('cluster_item_counts'),
		clusterItemRatings: this.dataset.prefixTableName('cluster_item_ratings'),
		itemClusterConts: 	this.dataset.prefixTableName('item_cluster_counts'),
		clusterItemTfidf: 	this.dataset.prefixTableName('cluster_item_tfidf'),
	}

	this.sqlBestItemsOverall = 
		'select distinct 					\
					ic.item_id  			\
		from 	' + table.clusterMembers + ' as cm, 	\
					txn_items as ti,  		\
					item_counts as ic 		\
		where 		cm.txn_id=ti.txn_id 	\
		and 		ti.item_id=ic.item_id 	\
		and 		cm.cluster_id=$1 		\
		order by 	ic.count desc 			\
		limit ' 	+ this.config.N 			


	this.sqlWithRatings = 
		'select 	item_id, count, \
					avg(rating) as avg 	\
		from 	' + table.clusterItemRatings + ' \
		where 		cluster_id=$1				\
		group by 	item_id 				\
		order by 	count desc, avg desc 	\
		limit ' + this.config.N 

	this.sqlBestItemsOfCluster = 
		'select * \
		from 	' + table.clusterItemCounts + ' \
		where 		cluster_id=$1 \
		order by 	count DESC \
		limit ' 	+ this.config.N


	this.sqlWithTfTfidf = 
		'select 	item_id,tfidf	\
		from 	' + table.clusterItemTfidf + ' \
		where 		cluster_id=$1		\
		order 		by tf desc, tfidf desc 	\
		limit ' + this.config.N

	this.sqlWithTfidf = 
		'select 	item_id,tfidf	\
		from 	' + table.clusterItemTfidf + ' \
		where 		cluster_id=$1		\
		order by 	tfidf desc 	\
		limit ' + this.config.N

	this.sqlRandomItem = 
		'select distinct item_id \
		from 	' + table.clusterItemCounts + ' \
		where 		cluster_id=$1 \
		order by 	random()';

}

	
