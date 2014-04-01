var seqStore 	= require('./seq-store')
var config 		= require('../config')




// Returns a key-value store where each key is a txn id 
// and each value is an array all the sequences within the txn
var inTxnBatch2 = function(txnBatch) {
	console.log('inTxnBatch2.find', txnBatch.length)
	
	var sequenceStore = []

	for(var i=0; i<txnBatch.length; i++) {
		sequenceStore = sequenceStore.concat(findSeqs(txnBatch[i])) 
	}

	console.log('inTxnBatch2.found', sequenceStore.length)

	return sequenceStore
}



var findSeqs = function(txn, min) {
	return(findSequences(txn, min || config.MIN_SEQUENCE_SIZE))
}





exports.inTxnBatch2 = inTxnBatch2
exports.findSeqs = findSeqs


var findSequences = function(txn, min) {
	var allSeqs = [] 
	var max = Math.min(
		txn.length,
		config.MAX_SEQUENCE_SIZE
	);

	for(var len= min; len <= max; len++) {
		allSeqs = allSeqs.concat(findSeqsOfLength(len, txn))
	}

	return allSeqs;
}


var findSeqsOfLength = function(len, txn) {
	var seqs = []
	
	for(var i=0; i+len<=txn.length; i++) {
		var seq = txn.slice(i, i+len)
		seqs.push(seq)
	}

	//console.log('found %d distinct sequences in txn', seqs.length)

	return seqs;
}

// var store = inTxnBatch2(
// 	[1,2],
// 	[[1,2,3], [4,5,6,7,8,9]]
// );

// console.log(store)