


function MarkovInfo(markovChain) {
	computeMcSums(markovChain)
	this.markovChain = markovChain
}




/**
 * get N cluster ids with highest values
 * @param  {[type]} N            [description]
 * @param  {[type]} lastClusters [description]
 * @return {[type]}              [description]
 */
MarkovInfo.prototype.getTopClusters = function(N, lastClusters) {
	var topClusters 	= []
	var partChain 		= this.info

	for (var i = 0; i < lastClusters.length; i++) {
		if(partChain) {
			var clusterId = lastClusters[i]
			partChain = partChain[clusterId]
		} else {
			return []
		}
	};

	var useSum = lastClusters.length < config.MARKOV_ORDER

	for(var key in partChain) {
		if(key !== 'sum') {
			var value = partChain[key]
			var candidate = {
				idx:key,
				sum: isNaN(value) ? value.sum : value
			}
			_addTopCluster(candidate, N, topClusters)
		}
			
	}

	return topClusters
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
	getInfo: getInfo,
	computeMcSums: computeMcSums,
	getMinIdx: getMinIdx,
	addTopCluster: addTopCluster
}




// var markovInfo = new MarkovInfo(example)
// console.log(markovInfo.info)