var seqStore 	= require('./seq-store')


var SeqCounter = exports.SeqCounter = function() {
	var counts = {}

	var countSequence = function(seq) {
		var key 	= seq.toString()
		var count 	= counts[key] 
		if(count) {
			counts[key] = count+1
		} else {
			counts[key] = 1
		}
	}

	//array of txns
	//every value is an array of all sequences within the corresponding txn
	this.count = function(seqStore) {

		var seqs = []
		seqStore.forEach(countSequence)
		return counts;
	}


}

