var help 		= require('../help')
var config 		= require('../config')
var clusterDb 	= require('../clustering2/db')
var async 		= require('async')

var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())

var memberStore = {}

var init = function(done) {
	async.waterfall([
		function(next) {
			db.all('select distinct cluster_id from clusters order by cluster_id asc', next)
		},
		function(rows, next) {
			fetchMembers(rows, next)
		},
	], done)
}

var fetchMembers = function(clusterIds, done) {
	console.log('fetchMembers')
	async.eachSeries(
		clusterIds,
		function(clusterId, next) {
			fetchMembersById(clusterId['cluster_id'], memberStore, next)
		},
		function(err) {
			done(err, memberStore)
		}
	);
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


var sql = null
if(config.ITEM_CHOICE_STRATEGY === 'tfTfidf') {
	sql = sqlWithTfTfidf
} 
else if(config.ITEM_CHOICE_STRATEGY === 'tfidf') {
	sql = sqlWithTfidf
} 
else if(config.ITEM_CHOICE_STRATEGY === 'bestItemsOfCluster') {
	sql = sqlBestItemsOfCluster
} 
else if(config.ITEM_CHOICE_STRATEGY === 'bestItemsOverall') {
	sql = sqlBestItemsOverall
} 
else if(config.ITEM_CHOICE_STRATEGY === 'withRatings') {
	if(typeof dataset.indices.rating === 'undefined') {
		throw 	'error'
		var e = 'ITEM_CHOICE_STRATEGY.withRatings requires \
				ratings to be availabel \
				no ratings were found!.';
	} 
	sql = sqlWithRatings
}



var fetchMembersById = function(clusterId, memberStore, done) {
	console.log('fetchMembersById', clusterId)
	async.waterfall([
		function(next) {			
			db.all(sql, clusterId, next)
		},
		function(members, next) {
			members.forEach(function(member, i) {
				members[i] = member['item_id']
			})
			memberStore[clusterId] = members
			console.log('members', members)
			done(null)
		}
	], done)
}



//
//Get n random items from array.
//
//
var getRandomItems = function(n, array) {
	var items 	= []
	var randomMembers = help.arrayRandomItems(n, array)
	randomMembers.forEach(function(member, i) {
		var array2 = member['item_ids']
		var index = Math.floor(Math.random() * array2.length)
		items.push(array2[index])
	})
	return items;

	

	for(var i=0; i<n; i++) {
		var index = Math.floor(Math.random() * array.length)
		var clusteredItem = array[index]
		var array2 = clusteredItem['item_ids']
		index = Math.floor(Math.random() * array2.length)
		items.push(array2[index])
	}
	return items
}


//first get all centroid ids
//then get all best 5 items of each cluster and save them.
//so no db access is needed during evaluation.

var getBestItems = function(n, clusterId) {
	return memberStore[clusterId].slice(0,n)
}

exports.init 			= init
exports.chooseItems = getRandomItems
exports.getRandomItems = getRandomItems
exports.getBestItems = getBestItems