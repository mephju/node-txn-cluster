

var transDb		= require('../transitions/db')


var markovInfo 		= require('../trainer/transition-builder/markov-info')

var ClusterGroup		= require('../trainer/clustering/cluster-group')
var ItemChoice 			= require('./item-choice')

var validate    = require('./validate')

var matrixTransform = require('./matrix-transform')
var numRecomm 	= require('./num-recomm')

var clusters  		= null
var fallbackItems 	= null
var markovChain 	= null
var markovChainInfo = null
var lastClusters 	= []




var init = function(dataset, fallbackRecomms, done) {
	console.log('init recommender')

	fallbackItems = fallbackRecomms

	async.waterfall([
		function(next) {
			clustering.buildClustersFromDb(dataset, next)
		},

		function(_clusters, next) {
			clusters = _clusters
			console.log('loadedClusteritems', clusters.clusters.length)
			var itemChoice = new ItemChoice(dataset, next)
			var sessionRecommender = new SessionBasedRecommender(dataset, itemChoice)
			itemChoiceStrategy.init(next)
		},
		function(memberStore, next) {

			
			transMarkovInfo.getInfo(next)
		},
		function(markovInfo) {
			markovChainInfo = markovInfo
			done(null)
		}
	], function(err) {
		if(err) { console.log('recommend/app error during init', err) } 
		done(err)
	})
}





var reset = function() {
	lastClusters = []
}






var recommend = function(session) {
	var centroidId = centroidGroup.findBestMatchSeq(session, true)

	//console.log('recommend', session, centroidId, lastClusters)
	lastClusters.push(centroidId)
	lastClusters = reduceLastClusters(lastClusters)

	var topClusters = markovChainInfo.getTopClusters(config.N, lastClusters)
	if(topClusters.length === 0) {
		return fallbackItems
	}
	var topClusters = numRecomm.computeNumRecomms(topClusters)

	topClusters.sort(help.objCmp)
	
	var recommendations = getRecommendations(topClusters)
	var len = recommendations.length
	
	if(len > config.N) {
		recommendations.length = config.N
	} 
	else if(len < config.N) {
		var diff = config.N - len
		for(var i=0; i<diff; i++) {
			recommendations.push(fallbackItems[i])
		}
	}
	//console.log('recommendations', recommendations.length)
	return recommendations
}


/**
 * we are only interested in the last N clusters that were chosen.
 * N is equal to config.MARKOV_ORDER
 * @param  {[type]} lastClusters [description]
 * @return {[type]}              [description]
 */
var reduceLastClusters = function(lastClusters) {
	var len = lastClusters.length
	if(len > config.MARKOV_ORDER) {
		return lastClusters.slice(len - config.MARKOV_ORDER)
	}

	return lastClusters
}





var getRecommendations = function(topClusters) {
	//console.log('getRecommendations', topClusters)
	var recomms = []
	topClusters.forEach(function(topCluster) {
		//console.log(topCluster)
		if(topCluster.idx === '-1') { return }
		var cluster 	= centroidGroup.clusters[topCluster.idx]
		var centroidId 	= cluster.centroidRow['cluster_id']
		var items 		= itemChoice.getBestItems(topCluster.numRecomms, centroidId)
			
		items.forEach(function(item) {
			recomms.push(item)
		})

	})
	return recomms
}




exports.reset = reset
exports.init = init
exports.recommend = recommend

