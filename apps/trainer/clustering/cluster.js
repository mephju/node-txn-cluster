

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

	//return log(this.members)

	
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
				members[j]['item_ids']
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





// Cluster.prototype._distanceSums = function(done) {

// 	var distanceSums = []
// 	var bag = {}

// 	async.eachChain(
// 		this.members,
// 		function(memberA, next) {
// 			bag.memberA = memberA
// 			this.distanceModel.getDistances(memberA, next)
// 		},
// 		function(distances, next) {

// 			var sum = 0
// 			for(var b=0, len=this.members.length; b<len; b++) {
// 				var memberB = this.members[b]
// 				sum += distances[memberB['txn_id']-1]

// 				// log('distance from db', distances[memberB['txn_id']-1])
// 				// log('distance calculated', this.distanceMeasure.distance(memberB['item_ids'], bag.memberA['item_ids']))
// 			}
// 			distanceSums.push(sum)
// 			next()
// 		},
// 		function(err) {
// 			done(err, distanceSums)
// 		},
// 		this
// 	);
// }


// /**
//  * Similar to Cluster._distanceSums but creates less I/O because 
//  * we retrieve distances for many txns instead of just one txn at a time.
//  *
//  * Get distanceSums for all members of this cluster.
//  * distanceSums[0] corresponds to distance sum of this.member[0]
//  * 
//  * @param  {Function} done [description]
//  * @return {[type]}        [description]
//  */
// Cluster.prototype._distanceSumsFast = function(done) {
// 	var distanceSums = []
	
// 	var memberGroups = this._buildMemberGroups()

// 	async.eachChain(
// 		memberGroups,
// 		function(group, next) {
// 			this.distanceModel.getDistancesForMany(group, next)
// 		},
// 		function(distancesForMany, next) {

// 			distancesForMany.forEach(function(distances) {
// 				var sum = 0
// 				for(var b=0, len=this.members.length; b<len; b++) {
// 					var memberB = this.members[b]
// 					var idxMemberB = memberB['txn_id']-1
// 					sum += distances[idxMemberB]
// 				}
// 				distanceSums.push(sum)
			
// 			}.bind(this))

				
// 			next()
// 		},
// 		function(err) {
// 			done(err, distanceSums)
// 		},
// 		this
// 	);

// }

// /**
//  * Divides this.members into chunks of 20 members each.
//  * @return {[type]} [description]
//  */
// Cluster.prototype._buildMemberGroups = function() {
// 	// log('Cluster._buildMemberGroups')
// 	var memberGroups = []
// 	var group = []

// 	for(var i=0; i<this.members.length; i++) {
// 		group.push(this.members[i])
// 		//push group every 20 txns AND
// 		//push group if loop is about to end
// 		if(i !== 0 && (i % 20) === 0 || i == (this.members.length - 1)) {
// 			memberGroups.push(group)
// 			group = []
// 		}
// 	}

// 	return memberGroups
// }


module.exports = Cluster

