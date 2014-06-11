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


var fetchMembersById = function(clusterId, memberStore, done) {
	console.log('fetchMembersById', clusterId)
	async.waterfall([
		function(next) {
			var sql = 'select distinct				\
							ic.item_id, ic.count 	\
				from 		cluster_members as cm, 	\
							txn_items as ti,  		\
							item_counts as ic 		\
				where 		cm.txn_id=ti.txn_id 	\
				and 		ti.item_id=ic.item_id 	\
				and 		cm.cluster_id=$1 		\
				order by 	ic.count desc 			\
				limit ' 	+ config.N 			
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

var getBestItems = function(clusterId) {
	return memberStore[clusterId]
}

exports.init 			= init
exports.chooseItems = getRandomItems
exports.getRandomItems = getRandomItems
exports.getBestItems = getBestItems