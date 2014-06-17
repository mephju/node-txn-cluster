var help = require('../help')
var sim = require('./sim')
var Simtrix = require('./simtrix').Simtrix

var Cluster = function(centroidRow) {
	this.centroidRow 	= centroidRow
	this.members 		= []
}

Cluster.prototype.clear = function() {
	help.clearArray(this.members)
}

 

Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}

// Cluster.prototype.sim = function(txnRow) {
// 	return this.simSeq(txnRow['item_ids'])
// 	// return this
// 	// .simMatrix
// 	// .getSim(
// 	// 	txnRow['txn_id'], 
// 	// 	this.centroidRow['txn_id']
// 	// );
// }

// Cluster.prototype.simSeq = function(txn) {
// 	return sim.calcSim(this.centroidRow['item_ids'], txn)
// }

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
	
	var similaritySums = null
	if(this.members.length > 2000) {
		similaritySums 	= getSimSumsSlow(this.members)	
	} 
	else {
		var simtrix 	= new Simtrix(this.members)
		similaritySums 	= getSimSums(simtrix)	
	}
	
	var maxIdx	 		= help.minIdx(similaritySums)
	var nextCentroid 	= this.members[maxIdx]

	console.log('recomputeCentroid maxidx', maxIdx, 'members.length', this.members.length)
	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	return changed
}


var getSimSums = function(simtrix) {
	return simtrix.matrix.map(function(row) {
		return row.reduce(function(l, r) {
			return l+r
		})
	})
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

exports.Cluster = Cluster