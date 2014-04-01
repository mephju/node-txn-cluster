// Creates all subsets of a set of items (txn)

var async 			= require('async')
var dataminerStore 	= require('./dataminer-store')


var itemsetCounts 	= {}



exports.count3 = function(txn, callback) {
	txn = txn.sort(cmp)
	console.log('count3')
	var itemsets = txn
	.map(function(itemId){ return [itemId] })

	
	extend3(itemsets, txn, function(e) {
			
		//dataminerStore.saveItemsetCounts(itemsetCounts, function(e) {
			
		//})

		
	})

	console.log(itemsetCounts, 'numofitemsets', Object.keys(itemsetCounts).length)
		console.log('should be', Math.pow(2, txn.length))
		dataminerStore.close()
}




var increase = function(itemset) {
	var setKey 	= itemset.toString()
	var count 	= itemsetCounts[setKey];
	itemsetCounts[setKey] = count ? ++count : 1
}


var cmp 	= function(a,b) { 
	return a<b ? -1 : a>b ? 1 : 0 
}



var readAndExtend = function(alphabet, callback) {
	console.log('readAndExtend')
	async.waterfall([
		function(cb) {
			dataminerStore.readItemsets(cb)		
		}, 
		function(itemsets, cb) {
			//console.log(itemsets)
			extend2(itemsets, alphabet, callback)
		}
	])
}



var extend3 = function(itemsets, alphabet, callback) {
	
	// var q = async.queue(function (task, callback) {
	// 	console.log('hello ' + task.name);
	// 	callback();
	// }, 2);
	
	if(itemsets.length > 0) {
		//console.log('extend3', itemsets)
		//var extendedSets = []
		itemsets.forEach(function(itemset) {
			//increase(itemset)
			var extendedSets = extendByAlphabet(itemset, alphabet)

			extend3(extendedSets, alphabet, callback)
			
		})
		//console.log('done ', itemsets)
		//console.log('')
	}

}







// Takes one itemset and creates all by-1 extension itemsets
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
















