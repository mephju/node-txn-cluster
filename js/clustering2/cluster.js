var help = require('../help')
var sim = require('./sim')

var Cluster = function(simMatrix, centroidRow) {
	this.simMatrix 		= simMatrix
	this.centroidRow 	= centroidRow
	this.members 		= []
	this.getSimilaritySums = getSimilaritySums
}

Cluster.prototype.clear = function() {
	help.clearArray(this.members)
}

 

Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}

Cluster.prototype.sim = function(txnRow) {
	return this
	.simMatrix
	.getSim(
		txnRow['txn_id'], 
		this.centroidRow['txn_id']
	);
}

Cluster.prototype.simSeq = function(txn) {
	return sim.calcSim(this.centroidRow['item_ids'], txn)
}


Cluster.prototype.recomputeCentroid = function() {

	console.log('recomputeCentroid', this.centroidRow['txn_id'], this.members.length)

	var similaritySums 	= this.getSimilaritySums()
	var maxIdx	 		= help.maxIdx(similaritySums)
	var nextCentroid 	= this.members[maxIdx]

	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	return changed
}


var getSimilaritySums = function() {
	var similarities	= []
	var len 			= this.members.length
	var members 		= this.members

	for (var i=0; i<len; i++) {
		var similarity = 0
		var memberA = members[i]
		
		for (var j=0; j<len; j++) {
			if(j != i) {
				var memberB = members[j]
				similarity += this.simMatrix.getSim(
					memberA['txn_id'], 
					memberB['txn_id']
				);	
			}
		}

		similarities[i] = similarity
	};
	return similarities
}

exports.Cluster = Cluster