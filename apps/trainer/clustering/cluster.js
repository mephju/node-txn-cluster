

var Cluster = function(centroidRow, distanceMeasure, distanceModel) {
	this.centroidRow 	= centroidRow
	this.members 		= [centroidRow]
	this.distanceMeasure = distanceMeasure
	this.distanceModel 	= distanceModel

}



Cluster.prototype.init = function(done) {
	return done()
	// async.wfall([
	// 	function(next) {
	// 		this.distanceModel.getDistances(this.centroidRow, next)
	// 	},
	// 	function(distances, next) {
	// 		this.distancesOfCentroid = distances
	// 		done()
	// 	}
	// ], this, done)
}



// Cluster.prototype.id = function() {
// 	return this.centroidRow['txn_id']
// }

Cluster.prototype.addMember = function(txnRow) {
	this.members.push(txnRow)
}


Cluster.prototype.distanceFast = function(txnRow) {
	return this.distancesOfCentroid[txnRow['txn_id']-1]
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

	// centroid for sure doesn't change if cluster has zero members
	if(this.members.length === 0) {
		return done(null, false)
	}

	async.wfall([
		function(next) {
			//this._distanceSums(next)
			this._distanceSumsFast(next)
		},
		function(distanceSums, next) {

			var minIdx	 		= help.minIdx(distanceSums)
			var nextCentroid 	= this.members[minIdx]
			var changed 		= false //nextCentroid['txn_id'] !== this.centroidRow['txn_id']
			
			if(this._hasChanged(this.centroidRow, nextCentroid)) {
				this.centroidRow = nextCentroid
				changed = true
			}

			console.log('recomputed Centroid with num members', this.members.length, 'found minIdx', minIdx, 'changed', changed, nextCentroid['txn_id'])
			
			done(null, changed)		
		}
	], this, done)
}

Cluster.prototype._hasChanged = function(currentCentroid, nextCentroid) {
	//return currentCentroid['txn_id'] !== nextCentroid['txn_id']
	return currentCentroid['item_ids'].toString() !== nextCentroid['item_ids'].toString()

}






Cluster.prototype._distanceSums = function(done) {

	var distanceSums = []
	var bag = {}

	async.eachChain(
		this.members,
		function(memberA, next) {
			bag.memberA = memberA
			this.distanceModel.getDistances(memberA, next)
		},
		function(distances, next) {

			var sum = 0
			for(var b=0, len=this.members.length; b<len; b++) {
				var memberB = this.members[b]
				sum += distances[memberB['txn_id']-1]

				// log('distance from db', distances[memberB['txn_id']-1])
				// log('distance calculated', this.distanceMeasure.distance(memberB['item_ids'], bag.memberA['item_ids']))
			}
			distanceSums.push(sum)
			next()
		},
		function(err) {
			done(err, distanceSums)
		},
		this
	);
}


/**
 * Similar to Cluster._distanceSums but creates less I/O because 
 * we retrieve distances for many txns instead of just one txn at a time.
 *
 * Get distanceSums for all members of this cluster.
 * distanceSums[0] corresponds to distance sum of this.member[0]
 * 
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
Cluster.prototype._distanceSumsFast = function(done) {
	var distanceSums = []
	
	var memberGroups = this._buildMemberGroups()

	async.eachChain(
		memberGroups,
		function(group, next) {
			this.distanceModel.getDistancesForMany(group, next)
		},
		function(distancesForMany, next) {

			distancesForMany.forEach(function(distances) {
				var sum = 0
				for(var b=0, len=this.members.length; b<len; b++) {
					var memberB = this.members[b]
					var idxMemberB = memberB['txn_id']-1
					sum += distances[idxMemberB]
				}
				distanceSums.push(sum)
			
			}.bind(this))

				
			next()
		},
		function(err) {
			done(err, distanceSums)
		},
		this
	);

}

/**
 * Divides this.members into chunks of 20 members each.
 * @return {[type]} [description]
 */
Cluster.prototype._buildMemberGroups = function() {
	// log('Cluster._buildMemberGroups')
	var memberGroups = []
	var group = []

	for(var i=0; i<this.members.length; i++) {
		group.push(this.members[i])
		//push group every 20 txns AND
		//push group if loop is about to end
		if(i !== 0 && (i % 20) === 0 || i == (this.members.length - 1)) {
			memberGroups.push(group)
			group = []
		}
	}

	return memberGroups
}


module.exports = Cluster

