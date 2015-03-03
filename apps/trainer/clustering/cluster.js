
var sim = require('../similarity')


var Cluster = function(centroidRow) {
	this.centroidRow 	= centroidRow
	this.members 		= []
}


Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}



Cluster.prototype.distance = function(txn) {
	return sim.calcSim(
		this.centroidRow['item_ids'],
		txn
	);
}


Cluster.prototype.recomputeCentroid = function() {

	console.log('recomputeCentroid', this.centroidRow['txn_id'], this.members.length)

	if(this.members.length === 0) {
		return false
	}
	
	var similaritySums = getSimSumsSlow(this.members)	
	
	var maxIdx	 		= help.minIdx(similaritySums)
	var nextCentroid 	= this.members[maxIdx]

	console.log('recomputeCentroid maxidx', maxIdx, 'members.length', this.members.length)
	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	return changed
}



var getSimSumsSlow = function(members) {
	var similarities	= []
	var len 			= members.length

	for (var i=0; i<len; i++) {
		var similarity = 0
		var memberA = members[i]

		for (var j=0; j<len; j++) {
			if(j != i) {
				var memberB = members[j]
				similarity += sim.calcSim(
					memberA['item_ids'], 
					memberB['item_ids']
				);	
			}
		}

		similarities[i] = similarity
	};
	return similarities
}

module.exports = Cluster