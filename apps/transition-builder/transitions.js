
var eachtick 	= require('eachtick')



exports.findTransitions = function(transModel, clusters, txnRows, done) {
	
	console.log('findTransitions for txns', txnRows.length)
	
	var manyTransitions = []


	eachtick(
		txnRows,
		function(i, txnRow, next) {
			process.stdout.write('.')

			manyTransitions.push({ 
				seq: findTransitionsForTxn(clusters, txnRow['item_ids']), 
				'txn_id': txnRow['txn_id'] 
			})

			if(manyTransitions.length > 1000 || i == txnRows.length-1) {
				var data = manyTransitions
				manyTransitions = []
				return transModel.insertTransitions(data, next)
			} 
			next(null)
		},
		function(err, stop) {
			console.log('findTransitions', 'done')
			done(err)
		}
	);
}


var findTransitionsForTxn = function(clusters, txn) {
		
	var previousCentroidId 	= -1
	var transitions 		= [-1]
	
	for(var len=1; len<=txn.length; len++) {
		
		var session = txn.slice(0, len)
		var matchedCentroidId = clusters.findBestMatchSeq(session)
		
		transitions.push(matchedCentroidId)
		
		// if(previousCentroidId !== -1 && matchedCentroidId === -1) {
		// 	var prev = clusters.clusters[previousCentroidId].centroidRow['item_ids'].toString()
		// 	console.log(-1, prev, session.toString())
		// }
		previousCentroidId = matchedCentroidId
	}

	return transitions
}


