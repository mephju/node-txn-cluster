// Creates all subsets of a set of items (txn)

var async 	= require('async')
var counter = require('./counter')


const MIN_SUPPORT = 1


var countTxn = exports.countTxn = function(dataset, txn, callback) {

	console.log('countTxn ', dataset.dbTable)
	console.log(txn)

	var table = dataset.dbTable
	
	var alphabet = txn.sort(cmp)
	var itemsets = alphabet.map(function(itemId){ return [itemId] })

	
	extend(table, itemsets, alphabet, function(e) {
		console.log('extend.finishe')
		console.log(counter.itemsetCounts)			
	})
}




var cmp 	= function(a,b) { 
	return a<b ? -1 : a>b ? 1 : 0 
}


var filterBySupport = function(table, itemsets, callback) {
	async.map(
		itemsets,
		function(itemset, next) {
			counter.getCount(table, itemset, next)
		},
		function(err, supports) {

			var freqItemsets = itemsets.filter(function(itemset, idx) {
				return supports[idx] > MIN_SUPPORT 
			})
			
			callback(null, freqItemsets)
		}
	);
}



var extend = function(table, itemsets, alphabet, callback) {
	
	if(itemsets.length == 0) {
		callback(null)
	} else {
		async.waterfall([
			function filter(next) {
				filterBySupport(table, itemsets, next)		
			},
			function(freqItemsets, next) {
				var extendedSets = []
				freqItemsets.forEach(function(itemset) {
					var res = extendByAlphabet(itemset, alphabet)
					
					if(res.length > 0) {
						console.log('adding', res)
						extendedSets = extendedSets.concat(res)
					}
				})
				console.log('after extend', extendedSets.length)
				extend(table, extendedSets, alphabet, callback)
			}, 
		])
		
	}

}







// Takes one itemset and creates all by-1-extension itemsets
var extendByAlphabet = function(extendSet, alphabet) {

	var extendItem 	= extendSet[extendSet.length-1]		//get last item of extendSet
	var newSets 	= []

	var j = alphabet.indexOf(extendItem) + 1			//get index of last item in alphabet
	for(j=j; j<alphabet.length; j++) {					//start extension with the next item after

		var newSet = extendSet.concat(alphabet[j])
		newSets.push(newSet.sort(cmp))
	}

	return newSets
}







// count('last_fm_txn_items', t, function())















