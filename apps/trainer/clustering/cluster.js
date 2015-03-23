

var Cluster = function(centroidRow, distanceMeasure, distanceModel) {
	this.centroidRow 	= centroidRow
	this.members 		= []
	this.distanceMeasure = distanceMeasure
	this.distanceModel 	= distanceModel
}

// Cluster.prototype.id = function() {
// 	return this.centroidRow['txn_id']
// }

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

	

	if(this.members.length === 0) {
		return done(null, false)
	}

	async.wfall([
		function(next) {
			this._distanceSumsFast(next)
		},
		function(distanceSums, next) {

			var minIdx	 		= help.minIdx(distanceSums)
			var nextCentroid 	= this.members[minIdx]
			var changed 		= nextCentroid['txn_id'] !== this.centroidRow['txn_id']
			this.centroidRow 	= nextCentroid

			console.log('recomputed Centroid with length', this.members.length, 'found minIdx', minIdx, 'changed', changed)
			
			done(null, changed)		
		}
	], this, done)
}





Cluster.prototype._distanceSums = function(done) {

	var distanceSums = []

	async.eachChain(
		this.members,
		function(memberA, next) {
			this.distanceModel.getDistances(memberA, next)
		},
		function(distances, next) {

			var sum = 0
			for(var b=0, len=this.members.length; b<len; b++) {
				var memberB = this.members[b]
				sum += distances[memberB['txn_id']-1]
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