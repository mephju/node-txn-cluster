
 



exports.findTransitions = function(clusters, txnRows, done) {
	
	console.log('findTransitions for txns', txnRows.length)
	
	var manyTransitions = []

	txnRows.forEach(function(txnRow) {
		process.stdout.write('.')

		manyTransitions.push({ 
			seq: findTransitionsForTxn(clusters, txnRow['item_ids']),
			'txn_id': txnRow['txn_id']
		})

	})

	done(null, manyTransitions)
}


var findTransitionsForTxn = function(clusters, txn) {
		
	
	var transitions 		= [-1]
	
	for(var len=1; len<=txn.length; len++) {
		
		var session = txn.slice(0, len)		
		transitions.push(clusters.findBestMatchSeq(session))
	}

	return transitions
}


