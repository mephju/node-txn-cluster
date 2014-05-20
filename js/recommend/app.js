
var async 		= require('async')
var transDb		= require('../transitions/db')
var clustering	= require('../clustering2/clustering')


var isInitialized 	= false
var centroidColl 	= null
var transMatrix 	= null
var transTotals 	= null







var init = function(callback) {
	console.log('init recommender')
	async.waterfall([
		function(next) {
			clustering.buildClustersFromDb(next)
		},
		function(clusters, next) {
			console.log('loadedClusteritems', clusters.clusters.length)
			centroidColl = clusters
			transDb.getTransMatrix(next)
		},
		function(transitionMatrix, next) {
			transMatrix = transitionMatrix
			 
			transTotals = transMatrix.map(function(row) {
				return row.reduce(function(previous, current) {
					return previous + current
				})
			})
			isInitialized = true
			callback(null)
		}
	], function(err) {
		if(err) { console.log('error', err) } 
		callback(err)
	})
}



// 
// Compute the number of recommendations each cluster should contribute to the list of
// recommendations.
// 
var getNumRecomms = function(numItems, transRow, rowSum) {
	return transRow.map(function(val) {
		return numItems * Math.round(val/rowSum)
	})
}


var recommend = function(session, numItems) {
	var centroidId 	= centroidColl.findBestMatchSeq(session)
	var transRow 	= transMatrix[centroidId]
	var rowSum 		= transTotals[centroidId]
	var numRecomms 	= getNumRecomms(numItems, transRow, rowSum)
	return getRecommendations(numRecomms)
}



var getRecommendations = function(numRecomms, cluster) {
	var recomms = []
	numRecomms.forEach(function(num, i) {
		recomms.push.apply(
			recomms, 
			getRandomItems(num, centroidColl.clusters[i].members)
		);
	})
	return recomms
}




var getRandomItems = function(n, array) {
	
	var items 	= []

	for(var i=0; i<n; i++) {
		var index = Math.floor(Math.random() * array.length)
		var clusteredItem = array[index]
		var array2 = clusteredItem['item_ids']
		index = Math.floor(Math.random() * array2.length)
		items.push(array2[index])
	}
	return items
}

exports.init = init
exports.recommend = recommend