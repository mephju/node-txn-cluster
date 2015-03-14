

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


/**
 * Find the member withing the cluster that has least summed distance to 
 * all other members.
 * 
 * @return {[type]} [description]
 */
Cluster.prototype.recomputeCentroid = function(done) {

	console.log(this.centroidRow['txn_id'], 'recomputeCentroid with length', this.members.length)

	if(this.members.length === 0) {
		return done(null, false)
	}
	
	var distanceSums 	= this._distanceSums()		
	var minIdx	 		= help.minIdx(distanceSums)
	var nextCentroid 	= this.members[minIdx]

	console.log('recomputeCentroid minidx', minIdx)
	var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	this.centroidRow 	= nextCentroid
	
	done(null, changed)		
}



Cluster.prototype._distanceSums = function() {

	var distanceSums = []

	for(var a=0,len=this.members.length; a<len; a++) {
		var memberA = this.members[a]
		var sum = 0
		for(var b=0; b<len; b++) {
			var memberB = this.members[b]
			sum += this.distanceMeasure.distance(memberA['item_ids'], memberB['item_ids'])
		}
		distanceSums.push(sum)
	}
		
	return distanceSums
}


module.exports = Cluster