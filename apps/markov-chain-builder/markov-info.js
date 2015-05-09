

/**
 * MarkovInfo is like MarkovChain but is enriched by the 
 * sums of values on each level.
 * {
 * 	00: {
 * 		22: 10,
 * 		34: 11,
 * 		sum: 21
 * 	},
 * 	44: {
 * 		2: 3
 * 		sum: 3
 * 	},
 * 	sum: 24
 * }
 *
 * So 00 has 21 outgoing edges and 00-22 has 10 edges.
 * So P(22 | 00) = 10 / 21
 *
 * 
 * @param {[type]} markovChain [description]
 */
function MarkovInfo(markovChain) {
	
	this.markovChain = markovChain
	computeMcSums(markovChain)
	// log.blue('MarkovInfo', this.markovChain)
}




/**
 * get N cluster ids with highest sums.
 * @param  {[type]} N            [description]
 * @param  {[type]} lastClusters [description]
 * @return {[type]}              [description]
 */
MarkovInfo.prototype.getTopClusters = function(N, lastClusters) {
	var topClusters 	= []
	var chain 		= subChain(lastClusters, this.markovChain)

	if(!chain) { return [] }
	/*
		Travel to the part within markovChain as denoted by lastClusters
		and save it in partChain.
	 */
	for(var key in chain) {
		if(key !== 'sum') {
			var value = chain[key]
			var candidate = {
				idx:key,
				sum: isNaN(value) ? value.sum : value
			}
			// _addTopCluster(candidate, this.markovChain.dataset.config.N, topClusters)
			_addTopCluster(candidate, N, topClusters)
		}
			
	}
	//log(topClusters)
	return topClusters
}

var subChain = function(lastClusters, chain) {
	for (var i = 0; i < lastClusters.length; i++) {
		if(!chain) { return null }
		var clusterId = lastClusters[i]
		chain = chain[clusterId]
	}
	return chain
}




/**
 * 
 * @param {[type]} candidate   [description]
 * @param {[type]} MAX         [description]
 * @param {[type]} topClusters [description]
 */
var _addTopCluster = function(candidate, MAX, topClusters) {
	if(topClusters.length < MAX) {
		return topClusters.push(candidate)
	} 

	// the candidate might replace a current topCluster
	for(var i=0; i<topClusters.length; i++) {
		var topKeyVal = topClusters[i]

		if(candidate.sum > topKeyVal.sum) {
			var minIdx = getMinIdx(topClusters)
			topClusters[minIdx] = candidate
			return
		}
	}
}


var getMinIdx = function(topClusters) {
	var min = {
		sum : Number.MAX_VALUE,
		idx: -1
	}

	for(var i=0; i<topClusters.length; i++) { 
		var entry = topClusters[i]
		if(entry.sum < min.sum) {
			min.sum = entry.sum
			min.idx = i
		}
	}

	return min.idx
}








/**
 * Enriches each level of the markov chain 
 * with the sum attribute. sum contains the sum of all values 
 * at the current level.
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
var computeMcSums = function(value) {

	log.write('c')
	var sum = 0
	for(var key in value) {
		var subvalue = value[key]
		if(isNaN(subvalue)) {
			sum += computeMcSums(subvalue)
		} else {
			sum += subvalue
		}
	}
	value.sum = sum


	return sum
}

var isObject = function(value) {
	return typeof value === 'object'
}




exports.MarkovInfo = MarkovInfo
exports.test = {
	MarkovInfo: MarkovInfo,
	computeMcSums: computeMcSums,
	getMinIdx: getMinIdx,
	addTopCluster: _addTopCluster
}




// var markovInfo = new MarkovInfo(example)
// console.log(markovInfo.info)