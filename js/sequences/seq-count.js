var seqStore 	= require('./seq-store')




// 
// {
// 	'1,2,3': {
// 		count:1,
// 		components: 3
// 	}
// }
var SeqCounter = exports.SeqCounter = function() {
	var counts = {}

	var countSequence = function(seq) {
		var key 	= seq.toString()
		var val 	= counts[key] 
		
		if(val) {
			val.count += 1
		} else {
			counts[key] = { 
				count: 1,
				components: seq.length
			}
		}
	}

	//array of txns
	//every value is an array of all sequences within the corresponding txn
	this.count = function(seqStore) {
		seqStore.forEach(countSequence)
		console.log(counts[seqStore[0]])
		return counts;
	}


}

