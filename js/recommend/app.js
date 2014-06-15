
var async 		= require('async')
var transDb		= require('../transitions/db')
var clusterGroupModule	= require('../clustering2/cluster-group')
var config		= require('../config')
var help 		= require('../help')
var validate    = require('./validate')
var itemChoice 	= require('./item-choice')

var isInitialized 	= false
var centroidColl 	= null
var transMatrix 	= null
var transTotals 	= null
var numRecomms		= []




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
				return help.arraySum(row)
			})

			numRecomms = transMatrix.map(function(row, i) {
				return row.map(function(val) {
					return config.N * Math.round(val / transTotals[i])
				})
			})

			validate.sanitizeMatrix(numRecomms)	
			
			if(!validate.isValid(transMatrix, numRecomms)) {
				return next('matrix is invalid')
			}	
			
			isInitialized = true
			next(null)
			
		},
		function(next) {
			itemChoice.init(next)
		}
	], function(err) {
		if(err) { console.log('error', err) } 
		callback(err)
	})
}




var recommend = function(session) {
	var centroidId 		= centroidColl.findBestMatchSeq(session, true)
	var transRow 		= transMatrix[centroidId]
	var rowSum 			= transTotals[centroidId]
	//numbers of items that each cluster should contribute
	var clusterNumRow 	= numRecomms[centroidId] 

	if(typeof clusterNumRow === 'undefined') {
		log(centroidId, 
			rowSum, 
			clusterNumRow)
			//centroidColl.clusters[centroidId].members);	
	}
	
	var recommendations = getRecommendations(clusterNumRow)

	if(recommendations.length === 0) {
		log(centroidId, 
			rowSum, 
			clusterNumRow)
			//centroidColl.clusters[centroidId]);	
	}

	return recommendations
}

var log = function(centroidId, rowSum, clusterNumRow, members) {
	console.log('centroidId', centroidId)
	//console.log('transrow', transRow)
	console.log('rowSum', rowSum)
	console.log('clusterNumRow', clusterNumRow)
	//console.log('members', centroidColl.clusters[centroidId].members)

	throw 'recommender returned no items'
}



var getRecommendations = function(clusterNumRow, cluster) {
	var recomms = []
	clusterNumRow.forEach(function(num, i) {
		if(num > 0) {
			//recomms.push(itemChoice.getRandomItems(num, centroidColl.clusters[i].members))
			var cl =  centroidColl.clusters[i]
			var centroidId = cl.centroidRow['cluster_id']
			var items = itemChoice.getBestItems(num, centroidId)
			
			items.forEach(function(item) {
				recomms.push(item)
			})
		}
	})
	return recomms
}




exports.init = init
exports.recommend = recommend