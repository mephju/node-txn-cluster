
var async 		= require('async')
var config		= require('../config')
var help 		= require('../help')





var computeNumRecomms = function(topClusters) {
	//console.log('computeNumRecomms', topClusters.length, topClusters)
	//topClusters.sort(help.objCmp)
	// console.log('computeNumRecomms')
	// console.log(topClusters)

	if(topClusters.length === 1) {
		topClusters[0].numRecomms = config.N
		return topClusters
	}

	var totalSum = topClusters.reduce(function(left, right) {
		return { sum: left.sum + right.sum }
	}).sum


	topClusters = reduceToMax(topClusters, totalSum)
	topClusters.forEach(function(item) {
		//console.log(item.sum, totalSum, item)
		item.numRecomms 	= Math.round(item.sum / totalSum * config.N)
	})
	
	return topClusters
}






var reduceToMax = function(topClusters, totalSum) {
	// console.log('reduceToMax')
	// console.log(topClusters)
	// console.log('')
	var reduced = false;

	for(var i=0; i<topClusters.length; i++) {
		
		var item = topClusters[i]

		// +0.1 is needed due to Javascript's faulty floating point calculations.
		if((item.sum / totalSum) > config.MAX_CONTRIBUTION + 0.1) {
			//console.log('need to reduce')
			topClusters = reduceOne(topClusters, totalSum, i)
			
			totalSum = topClusters.reduce(function(left, right) {
				return { sum: left.sum+right.sum }
			}).sum;
			
			reduced = true
		}
	}

	if(reduced) {
		return reduceToMax(topClusters, totalSum)
	}
	return topClusters
}




var reduceOne = function(topClusters, totalSum, i) {
	var max = Math.round(totalSum * config.MAX_CONTRIBUTION)
	//console.log(totalSum, config.MAX_CONTRIBUTION, max)
	var item = topClusters[i]
	var diff = item.sum - max
	item.sum = max

	var countRemaining = topClusters.length - 1
	var diffPercentage = diff / totalSum
	var part1 = diffPercentage * 1/countRemaining


	topClusters.forEach(function(item, idx) {
		if(i !== idx) {
			item.sum *= 1 + part1/(item.sum/totalSum)
		}
	})
	return topClusters
}

exports.computeNumRecomms = computeNumRecomms
exports.test = {
	computeNumRecomms : computeNumRecomms,
	reduceToMax : reduceToMax,
	reduceOne : reduceOne
}