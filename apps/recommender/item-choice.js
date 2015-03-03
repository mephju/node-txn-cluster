
var sqlite3		= require('sqlite3').verbose()


function ItemChoice(dataset) {
	this.dataset = dataset
	this.db = new sqlite3.Database(dataset.dbPath)
	this.memberStore = {}
	this.sql = null
	
	switch(dataset.config.ITEM_CHOICE_STRATEGY) {
		case 'tfTfidf':					sql = db.prepare(sqlWithTfTfidf);			break;
		case 'tfidf':					sql = db.prepare(sqlWithTfidf);				break;
		case 'bestItemsOfCluster':		sql = db.prepare(sqlBestItemsOfCluster);	break;
		case 'bestItemsOverall':		sql = db.prepare(sqlBestItemsOverall);		break
		case 'withRatings': 			sql = db.prepare(sqlWithRatings); 
			if(typeof dataset.indices.rating === 'undefined') {
				throw 	'ITEM_CHOICE_STRATEGY.withRatings cannot be applied to dataset without ratings'
			} 
			break
		default: 
			throw 'no item choice strategy chosen'
	}
	else if(config.ITEM_CHOICE_STRATEGY === 'withRatings') {
			
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

ItemChoice.prototype.fetchMembers = function(clusterIds, done) {
	console.log('fetchMembers')
	async.eachSeries(
		clusterIds,
		function(clusterId, next) {
			fetchMembersById(clusterId['cluster_id'], next)
		},
		function(err) {
			done(err, memberStore)
		}
	);
}



//first get all centroid ids
//then get all best 5 items of each cluster and save them.
//so no db access is needed during evaluation.
var ItemChoice.prototype.getBestItems = function(n, clusterId) {
	return this.memberStore[clusterId].slice(0,n)
}

var ItemChoice.prototype.fetchMembersById = function(clusterId, done) {
	console.log('fetchMembersById', clusterId)
	var strategy = this
	async.waterfall([
		function(next) {			
			strategy.sql.all(clusterId, next)
		},
		function(members, next) {
			members.forEach(function(member, i) {
				members[i] = member['item_id']
			})
			strategy.memberStore[clusterId] = members
			console.log('members', members)
			done(null)
		}
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

var sqlBestItemsOverall = 
	'select distinct 					\
				ic.item_id, ic.count 	\
	from 		cluster_members as cm, 	\
				txn_items as ti,  		\
				item_counts as ic 		\
	where 		cm.txn_id=ti.txn_id 	\
	and 		ti.item_id=ic.item_id 	\
	and 		cm.cluster_id=$1 		\
	order by 	ic.count desc 			\
	limit ' 	+ config.N 			


var sqlWithRatings = 
	'select 	item_id, count, \
				avg(rating) as avg 	\
	from 		cluster_item_ratings 		\
	where 		cluster_id=$1				\
	group by 	item_id 				\
	order by 	count desc, avg desc 	\
	limit ' + config.N 

var sqlBestItemsOfCluster = 'select * \
			from 		cluster_item_counts \
			where 		cluster_id=$1 \
			order by 	count DESC \
			limit ' 	+ config.N


var sqlWithTfTfidf = 
	'select item_id,tfidf	\
	from cluster_item_tfidf	\
	where cluster_id=$1		\
	order by tf desc, tfidf desc 	\
	limit ' + config.N

var sqlWithTfidf = 
	'select item_id,tfidf	\
	from cluster_item_tfidf	\
	where cluster_id=$1		\
	order by tfidf desc 	\
	limit ' + config.N











exports.init 			= init
exports.chooseItems = getRandomItems
exports.getRandomItems = getRandomItems
exports.getBestItems = getBestItems