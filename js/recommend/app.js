
var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var clusterDb	= require('../clustering/cluster-db')
var transDb		= require('../transitions/db')
var kmCentroidColl 	= require('../clustering/kmeans-centroid-collection')

var centroidColl 	= null
var transMatrix 	= null
var transTotals 	= null



var initIfNeeded = function(callback) {
	async.waterfall([
		function(next) {
			if(!centroidColl) {
				kmCentroidColl.buildFromDb(next)	
			} else {
				next(null, centroidColl)
			}
		},
		function(centroidCollection, next) {
			centroidColl = centroidCollection
			if(!transMatrix) {
				transDb.getTransMatrix(next)
			} else {
				next(null, transMatrix)
			}
		},
		function(transitionMatrix, next) {
			transMatrix = transitionMatrix
			if(!transTotals) {  
				transTotals = transMatrix.map(function(row) {
					return row.reduce(function(previous, current) {
						return previous + current
					})
				})
			}
			callback(null)
		}
	], callback)
}



var getItemsPerCluster = function(numItems, transRow, rowSum) {
	return transRow.map(function(val, idx, arr) {
		return parseInt(
			Math.round(numItems * (val/rowSum))
		);
	})
}


var recommend = function(session, numItems, callback) {
	async.waterfall([
		function(next) {
			initIfNeeded(next)
		},
		function(next) {
			var centroid 	= centroidColl.findBestMatch(session)
			var transRow 	= transMatrix[centroid.id]
			var rowSum 		= transTotals[centroid.id]

			var itemsPerCluster = getItemsPerCluster(numItems, transRow, rowSum)
			db.getRecommendations(itemsPerCluster, next)
		},
		function(recomItemIds, next) {
			//console.log(recomItemIds)
			callback(null, recomItemIds)
		}
	], 
	function(err) {
		console.log('finished recommending', err || '')
		if(callback) { callback(err) }
	})
}

exports.recommend = recommend


//recommend([1,2], 15)