
var sim = require('../similarity')


var Cluster = function(centroidRow, distanceMeasure) {
	this.centroidRow 	= centroidRow
	this.members 		= []
	this.distanceMeasure = distanceMeasure
}


Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}



Cluster.prototype.distance = function(txn) {
	return this.distanceMeasure.distance(
		this.centroidRow['item_ids'],
		txn
	);
}


Cluster.prototype.recomputeCentroid = function() {

	console.log('recomputeCentroid', this.centroidRow['txn_id'], this.members.length)

	if(this.members.length === 0) {
		return false
	}
	
	var similaritySums = this.getSimSumsSlow(this.members)	
	
	var minIdx	 		= help.minIdx(similaritySums)
	var nextCentroid 	= this.members[minIdx]

	console.log('recomputeCentroid maxidx', minIdx, 'members.length', this.members.length)
	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	return changed
}



Cluster.prototype.getSimSumsSlow = function(members) {
	var similarities	= []
	var len 			= members.length

	for (var i=0; i<len; i++) {
		var similarity = 0
		var memberA = members[i]

		for (var j=0; j<len; j++) {
			if(j != i) {
				var memberB = members[j]
				similarity += this.distanceMeasure.distance(
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