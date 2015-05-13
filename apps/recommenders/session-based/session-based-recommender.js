var NumRec 	= require('./num-recomm').NumRec
var Recommender = require('../recommender')



function SessionBasedRecommender(params) {
	Recommender.call(this, params.dataset)
	this.params = params
	this.markovInfo = params.markovInfo
	this.clusters = params.clusters
	this.itemChoice = params.itemChoice
	this.fallbackItems = params.fallbackItems
	this.numRec = new NumRec(params.dataset)


	/**
	 * Important for finding cluster transitions when markov chain order > 1
	 * In that case the new contributing clusters are chosen depending on which clusters were chosen last
	 * @type {Array}
	 */
	this.lastClusters = []
}

module.exports = SessionBasedRecommender

SessionBasedRecommender.prototype = Object.create(Recommender.prototype, {
	constructor: SessionBasedRecommender
})


SessionBasedRecommender.prototype.recommend = function(session) {
	var config = this.dataset.config
	var centroidId = this.clusters.findBestMatchSeq(session, true)	

	this.lastClusters = this._updateLastClusters(centroidId, this.lastClusters)

	var topClusters = this.markovInfo.getTopClusters(config.N, this.lastClusters)
	if(topClusters.length === 0) {
		//log.write('f')
		return this.fallbackItems
	}

	//log.write('r')
	
	var topClusters = this.numRec.computeNumRecomms(topClusters)

	topClusters.sort(help.objCmp)
	
	var recommendations = this._getRecommendations(topClusters)
	var len = recommendations.length
	
	if(len > config.N) {
		recommendations.length = config.N
	} 
	else if(len < config.N) {
		var diff = config.N - len
		for(var i=0; i<diff; i++) {
			recommendations.push(this.fallbackItems[i])
		}
	}

	return recommendations
}


/**
 * We are only interested in the last N clusters that were chosen.
 * N is equal to config.MARKOV_ORDER.
 *
 * I think this can be improved by not using slice()1
 * @param  {[type]} lastClusters [description]
 * @return {[type]}              [description]
 */
SessionBasedRecommender.prototype._updateLastClusters = function(centroidId, lastClusters) {
	//log('_updateLastClusters length', lastClusters.length)
	lastClusters.push(centroidId)
	var config = this.dataset.config

	if(lastClusters.length > config.MARKOV_ORDER) {
		lastClusters.shift()
	}

	return lastClusters
}


SessionBasedRecommender.prototype._getRecommendations = function(topClusters) {

	var recomms = []
	var _this = this
	topClusters.forEach(function(topCluster) {

		if(topCluster.idx === '-1') { return }
		var cluster 	= _this.clusters.clusters[topCluster.idx]
		var centroidId 	= cluster.centroidRow['cluster_id']
		var items 		= _this.itemChoice.getBestItems(topCluster.numRecomms, centroidId)
			
		items.forEach(function(item) {
			recomms.push(item)
		})

	})
	return recomms
}

SessionBasedRecommender.prototype.reset = function() {
	this.lastClusters.length = 0
}




