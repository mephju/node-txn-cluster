
var async 		= require('async')
var transDb		= require('../transitions/db')
var clusterGroupModule	= require('../clustering2/cluster-group')
var config		= require('../config')
var help 		= require('../help')

var isInitialized 	= false
var centroidColl 	= null
var transMatrix 	= null
var transTotals 	= null
var d 		= []




var init = function(callback) {
	console.log('init recommender')
	async.waterfall([
		function(next) {
			clusterGroupModule.buildFromDb(next)
		},

		function(clusters, next) {
			console.log('loadedClusteritems', clusters.clusters.length)
			centroidColl = clusters
			transDb.getTransMatrix(next)
		},
		function(transitionMatrix, next) {
			


			transMatrix = transitionMatrix
			 
			transTotals = transMatrix.map(function(row, i) {
				var rowSum = row.reduce(function(previous, current) {
					return previous + current
				})
				if(rowSum === 0) {
					console.log('row', i, 'is 0')
				}
				return rowSum
			})

			numRecomms = transMatrix.map(function(row, i) {
				return row.map(function(val) {
					return config.N * Math.round(val / transTotals[i])
				})
			})

			sanitizeNumRecomms(numRecomms)	
			console.log('sanitized', numRecomms.length)
			if(!isValidMatrix(transMatrix)) {
				console.log('error', 'transMatrix is invalid')
				return next('transMatrix is invalid')
			}
			if(!isValidMatrix(numRecomms)) {
				console.log('error', 'numRecomms is invalid')
				return next('numRecomms is invalid')
			}
			if(numRecomms.length !== transMatrix.length) {
				return next('numRecomms is weird error')
			}
			
			isInitialized = true
			next(null)
			
		}
	], function(err) {
		if(err) { console.log('error', err) } 
		callback(err)
	})
}

var isValidMatrix = function(numRecomms) {
	var len = numRecomms.length
	for(var i=0; i<len; i++) {
		for(var j=0; j<numRecomms.length; j++) {
			var item = numRecomms[i][j]
			if(item === null || isNaN(item)) {
				console.log('numRecomms', i, j, item)
				return false;
			}
		}
	}
	return true
}


var sanitizeNumRecomms = function(numRecomms) {
	var len = numRecomms.length
	for(var i=0; i<len; i++) {
		var row = numRecomms[i]
		var rowSum = help.arraySum(row)

		if(rowSum < 5) {
			var maxIndices = help.nMaxIndices(transMatrix[i], config.N)
			maxIndices.forEach(function(maxIndex, i) {
				row[maxIndex] = 1
			})
			console.log('sanitized row', i, 'rowsum', help.arraySum(row))

		}
	}
}


var recommend = function(session) {
	var centroidId 		= centroidColl.findBestMatchSeq(session)
	var transRow 		= transMatrix[centroidId]
	var rowSum 			= transTotals[centroidId]
	//numbers of items that each cluster should contribute
	var clusterNumRow 	= numRecomms[centroidId] 
	
	var recommendations = getRecommendations(clusterNumRow)

	if(recommendations.length === 0) {
		console.log('centroidId', centroidId)
		//console.log('transrow', transRow)
		console.log('rowSum', rowSum)
		console.log('clusterNumRow', clusterNumRow)
		console.log('members', centroidColl.clusters[centroidId].members)

		throw 'recommender returned no items'
	}

	return recommendations
}



var getRecommendations = function(numRecomms, cluster) {
	var recomms = []
	numRecomms.forEach(function(num, i) {
		if(num > 0) {
			recomms.push(getRandomItems(num, centroidColl.clusters[i].members))
		}
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