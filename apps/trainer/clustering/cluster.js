

var Cluster = function(centroidRow, distanceMeasure) {
	this.centroidRow 	= centroidRow
	this.members 		= [centroidRow]
	this.distanceMeasure = distanceMeasure
}

Cluster.prototype.clearMembers = function() {
	this.members = [this.centroidRow]
}


Cluster.prototype.init = function(done) {
	log('Cluster.init', this.centroidRow['txn_id'])
	return done()
}

Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}


Cluster.prototype.d = function(txnRow) {
	return this.distanceMeasure.distance(
		this.centroidRow['item_ids'],
		txnRow['item_ids'],
		this.centroidRow['sorted_item_ids'],	// only valid if jaccard-levenshtein
		txnRow['sorted_item_ids']				// only valid if jaccard-levenshtein
	);
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
Cluster.prototype.recomputeCentroid = function() {

	// centroid for sure doesn't change if cluster has zero members
	if(this.members.length === 0) {
		return done(null, false)
	}
	
	var distanceSums 	= this._distanceSums()
	var minIdx	 		= help.minIdx(distanceSums)
	var nextCentroid 	= this.members[minIdx]
	var changed 		= false //nextCentroid['txn_id'] !== this.centroidRow['txn_id']
	
	if(this._hasChanged(this.centroidRow, nextCentroid)) {
		this.centroidRow = nextCentroid
		changed = true
	}

	log('recomputed Centroid with num members', this.members.length, 'found minIdx', minIdx, 'changed', changed, nextCentroid['txn_id'])
	
	return changed	
}

Cluster.prototype._hasChanged = function(currentCentroid, nextCentroid) {
	return currentCentroid['item_ids'].toString() !== nextCentroid['item_ids'].toString()

}

Cluster.prototype._distanceSums = function() {

	var distanceSums = []
	var bag = {}
	var len = this.members.length

	var matrix = Cluster.buildSimMatrix(this.members, this.distanceMeasure)
	for(var r=0; r<len; r++) { //r for row
		distanceSums[r] = Cluster.sumRow(matrix, r)
	}
	return distanceSums
}

Cluster.buildSimMatrix = function(members, distanceMeasure) {
	var matrix = []
	var len = members.length
	
	for(var i=0; i<len; i++) {
		
		matrix[i] = []
		matrix[i][i] = 0

		for(var j=i+1; j<len; j++) {
			matrix[i][j] = distanceMeasure.distance(
				members[i]['item_ids'], 
				members[j]['item_ids'],
				members[i]['sorted_item_ids'], 	// only valid if jaccard-levenshtein
				members[j]['sorted_item_ids'] 	// only valid if jaccard-levenshtein
			);
		}
	}
	return matrix
}

Cluster.sumRow = function(matrix, r) {
	var sum = 0
	for(var i=0; i<matrix[r].length; i++) {
		if(i < r) {
			sum += matrix[i][r]
		} else if(i > r) {
			sum += matrix[r][i]
		} 
	} 
	return sum
}


module.exports = Cluster

