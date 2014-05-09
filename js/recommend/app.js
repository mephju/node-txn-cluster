
var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var clusterDb	= require('../clustering/cluster-db')
var transDb		= require('../transitions/db')
var kmCentroidColl 	= require('../clustering/kmeans-centroid-collection')


var isInitialized = false
var centroidColl 	= null
var transMatrix 	= null
var transTotals 	= null
var clusterItems 	= []





var loadClusterItems = function(centroidColl, callback) {
	console.log('loadClusterItems ', centroidColl.centroids.length)
	async.eachSeries(
		centroidColl.centroids,
		function(centroid, next) {
			db.getItemsForCluster(centroid.id, function(err, items) {
				clusterItems[centroid.id] = items
				next(err)
			}) 
		},
		function(err) {
			//console.log('loadedClusteritems', clusterItems)
			callback(err, clusterItems)
		}
	);
}

var initIfNeeded = function(callback) {
	async.waterfall([
		function(next) {
			db.buildClusterItemsView(next)
		},
		function(next) {
			kmCentroidColl.buildFromDb(next)	
		},
		function(centroidCollection, next) {
			centroidColl = centroidCollection
			loadClusterItems(centroidColl, next)
		},
		function(clusterItems, next) {
			console.log('loadedClusteritems', clusterItems.length)
			//console.log('loadedClusteritems', clusterItems)
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
	], callback)
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


var recommend = function(session, numItems, callback) {
	async.waterfall([
		function(next) {
			if(!isInitialized) { 
				initIfNeeded(next) 
			}
			else { 
				next(null) 
			}
		},
		function(next) {
			var centroid 	= centroidColl.findBestMatch(session)
			var transRow 	= transMatrix[centroid.id]
			var rowSum 		= transTotals[centroid.id]

			var numRecomms 	= getNumRecomms(numItems, transRow, rowSum)
			var recomms 	= getRecommendations(numRecomms, next)
			next(null, recomms)
		},
		function(recomItemIds, next) {
			callback(null, recomItemIds)
		}
	], 
	function(err) {
		console.log('finished recommending', err || '')
		if(callback) { callback(err) }
	})
}



var getRecommendations = function(numRecomms) {
	var recomms = []
	numRecomms.forEach(function(num, i) {
		recomms.push.apply(
			recomms, 
			getRandomItems(num, clusterItems[i])
		);
	})
	//console.log('recomms', recomms)
	return recomms
}




var getRandomItems = function(n, array) {
	
	var max 	= array.length
	var items 	= []

	for(var i=0; i<n; i++) {
		var index = Math.floor(Math.random() * max)
		items.push(array[index])
	}
	return items
}

exports.recommend = recommend


//recommend([1,2], 15)