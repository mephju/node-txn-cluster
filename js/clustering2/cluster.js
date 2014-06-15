var help = require('../help')
var sim = require('./sim')
var Simtrix = require('./simtrix').Simtrix

var Cluster = function(centroidRow) {
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
	return this.simSeq(txnRow['item_ids'])
	// return this
	// .simMatrix
	// .getSim(
	// 	txnRow['txn_id'], 
	// 	this.centroidRow['txn_id']
	// );
}

Cluster.prototype.simSeq = function(txn) {
	return sim.calcSim(this.centroidRow['item_ids'], txn)
}


Cluster.prototype.recomputeCentroid = function() {

	console.log('recomputeCentroid', this.centroidRow['txn_id'], this.members.length)

	if(this.members.length === 0) {
		return false
	}
	
	var simtrix 		= new Simtrix(this.members)
	var similaritySums 	= this.getSimilaritySums(simtrix)
	var maxIdx	 		= help.maxIdx(similaritySums)
	var nextCentroid 	= this.members[maxIdx]

	console.log('recomputeCentroid maxidx', maxIdx, 'members.length', this.members.length)
	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	return changed
}


var getSimilaritySums = function(simtrix) {

	return simtrix.matrix.map(function(row) {
		return row.reduce(function(l, r) {
			return l+r
		})
	})
}

exports.Cluster = Cluster