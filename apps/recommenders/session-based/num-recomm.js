function NumRec(dataset) {
	this.dataset = dataset
	this.config = this.dataset.config
}


NumRec.prototype.computeNumRecomms = function(topClusters) {

	if(topClusters.length === 1) {
		topClusters[0].numRecomms = this.config.N
		return topClusters
	}

	var totalSum = topClusters.reduce(function(left, right) {
		return { sum: left.sum + right.sum }
	}).sum


	topClusters = this.reduceToMax(topClusters, totalSum)
	topClusters.forEach(function(item) {
		item.numRecomms 	= Math.round(item.sum / totalSum * this.config.N)
	}.bind(this))
	
	return topClusters
}






NumRec.prototype.reduceToMax = function(topClusters, totalSum) {

	var reduced = false;

	for(var i=0; i<topClusters.length; i++) {
		
		var item = topClusters[i]

		// +0.1 is needed due to Javascript's faulty floating point calculations.
		if((item.sum / totalSum) > this.config.MAX_CONTRIBUTION + 0.1) {
	
			topClusters = this.reduceOne(topClusters, totalSum, i)
			
			totalSum = topClusters.reduce(function(left, right) {
				return { sum: left.sum+right.sum }
			}).sum;
			
			reduced = true
		}
	}

	if(reduced) {
		return this.reduceToMax(topClusters, totalSum)
	}
	return topClusters
}




NumRec.prototype.reduceOne = function(topClusters, totalSum, i) {
	var max = Math.round(totalSum * this.config.MAX_CONTRIBUTION)

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

exports.NumRec = NumRec
//exports.computeNumRecomms = computeNumRecomms
// exports.test = {
// 	computeNumRecomms : computeNumRecomms,
// 	reduceToMax : reduceToMax,
// 	reduceOne : reduceOne
// }