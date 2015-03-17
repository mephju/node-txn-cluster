
var sqlite3		= require('sqlite3').verbose()


function ItemChoice(dataset) {
	this.dataset = dataset
	this.config = dataset.config

	this.db = new sqlite3.Database(dataset.dbPath)
	this.memberStore = {}
	this.sql = null
	
	switch(dataset.config.ITEM_CHOICE_STRATEGY) {
		case 'tfTfidf':					this.sql = this.db.prepare(this.sqlWithTfTfidf);			break;
		case 'tfidf':					this.sql = this.db.prepare(this.sqlWithTfidf);			break;
		case 'bestItemsOfCluster':		this.sql = this.db.prepare(this.sqlBestItemsOfCluster);	break;
		case 'bestItemsOverall':		this.sql = this.db.prepare(this.sqlBestItemsOverall);		break
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
	var strategy = this
	async.waterfall([
		function(next) {
			strategy.db.all('select distinct cluster_id from clusters order by cluster_id asc', next)
		},
		function(rows, next) {
			strategy.fetchMembers(rows, next)
		},
	], done)
}

ItemChoice.prototype.fetchMembers = function(clusters, done) {
	console.log('fetchMembers')
	
	var _this = this
	var clusterId = null

	async.eachChain(
		clusters,
		function(cluster, next) {
			clusterId = cluster['cluster_id']			
			_this.sql.all(clusterId, next)
		},
		function(members, next) {
			members.forEach(function(member, i) {
				members[i] = member['item_id']
			})
			_this.memberStore[clusterId] = members
			console.log('members', members)
			done(null)
		},
		done
	);
}



//first get all centroid ids
//then get all best 5 items of each cluster and save them.
//so no db access is needed during evaluation.
ItemChoice.prototype.getBestItems = function(n, clusterId) {
	return this.memberStore[clusterId].slice(0,n)
}

ItemChoice.prototype.fetchMembersById = function(clusterId, done) {
	console.log('fetchMembersById', clusterId)
	var strategy = this
	async.waterfall([
		
	], done)
}


/**
 * Get n random items from array. 
 * @param  {[type]} n     [description]
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
var getRandomItems = function(n, array) {
	
	return help.arrayRandomItems(n, array).map(function(item, i) {
		var txn = item['item_ids']
		var index = Math.floor(Math.random() * txn.length)
		return txn[index]
	})
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
ItemChoice.prototype.sql = function() {
	this.sqlBestItemsOverall = 
		'select distinct 					\
					ic.item_id, ic.count 	\
		from 		cluster_members as cm, 	\
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
		from 		cluster_item_ratings 		\
		where 		cluster_id=$1				\
		group by 	item_id 				\
		order by 	count desc, avg desc 	\
		limit ' + this.config.N 

	this.sqlBestItemsOfCluster = 'select * \
				from 		cluster_item_counts \
				where 		cluster_id=$1 \
				order by 	count DESC \
				limit ' 	+ this.config.N


	this.sqlWithTfTfidf = 
		'select item_id,tfidf	\
		from cluster_item_tfidf	\
		where cluster_id=$1		\
		order by tf desc, tfidf desc 	\
		limit ' + this.config.N

	this.sqlWithTfidf = 
		'select item_id,tfidf	\
		from cluster_item_tfidf	\
		where cluster_id=$1		\
		order by tfidf desc 	\
		limit ' + this.config.N

}

	










// exports.init 			= init
// exports.chooseItems = getRandomItems
// exports.getRandomItems = getRandomItems
// exports.getBestItems = getBestItems