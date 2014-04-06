var seqStore 	= require('./seq-store')
var config 		= require('../config')




// Returns a key-value store where each key is a txn id 
// and each value is an array all the sequences within the txn
var inTxnBatch = function(txnBatch) {
	console.log('inTxnBatch.find', txnBatch.length)
	
	var allSeqs = []

	for(var i=0; i<txnBatch.length; i++) {
		findSeqs(txnBatch[i], config.MIN_SEQUENCE_SIZE, allSeqs)
	}

	console.log('inTxnBatch.found', allSeqs.length)

	return allSeqs
}



var findSeqs = function(txn, min, allSeqs) {
	allSeqs = allSeqs || []
	min = min || config.MIN_SEQUENCE_SIZE

	var max = Math.min(
		txn.length,
		config.MAX_SEQUENCE_SIZE
	);

	for(var len=min; len <= max; len++) {
		findSeqsOfLength(len, txn, allSeqs)
	}

	return allSeqs;

}


var findSeqsOfLength = function(len, txn, seqs) {	
	seqs = seqs || []
	for(var i=0; i+len<=txn.length; i++) {
		var seq = txn.slice(i, i+len)
		seqs.push(seq)
	}
	return seqs
	//console.log('found %d distinct sequences in txn', seqs.length)
}


exports.inTxnBatch = inTxnBatch
exports.findSeqs = findSeqs
exports.findSeqsOfLength = findSeqsOfLength
