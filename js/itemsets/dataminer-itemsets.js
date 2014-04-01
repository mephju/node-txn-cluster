// Creates all subsets of a set of items (txn)

var async 			= require('async')
var dataminerStore 	= require('./dataminer-store')


var itemsetCounts 	= {}


var count = exports.count = function(txn, callback) {
	var itemsets = txn
	.sort(cmp)
	.map(function(itemId){ return [itemId] })

	var powerSetSize = Math.pow(2, txn.length) - 1
	 
	if(powerSetSize > 100000) {
		console.log('using extend')
		dataminerStore.addItemsets(itemsets, function(e) {
			extend(txn, function(err) {
				console.log('done with extend')
				dataminerStore.close()
				console.log(itemsetCounts, 'numofitemsets', Object.keys(itemsetCounts).length)
				console.log('should be', powerSetSize)
				callback(null)
			})		
		})	
	} else {
		console.log('using extendMem')
		extendMem(itemsets, txn) 	
		console.log('done with extendMem')
		dataminerStore.close()
		console.log(itemsetCounts)
		callback(null)
	}
}



exports.count2 = function(txn, callback) {
	for(k=1; k<=txn.length; k++) {
		console.log(genItemsets(k, txn))
	}

	console.log(itemsetCounts, 'numofitemsets', Object.keys(itemsetCounts).length)
	console.log('should be', Math.pow(2, txn.length))
	console.log(genItemsets(3, txn))
	callback(null)
}



exports.count3 = function(txn, callback) {
	console.log('count3')
	var itemsets = txn
	.sort(cmp)
	.map(function(itemId){ return [itemId] })

	extend2(itemsets, txn, function(e) {
			
		//dataminerStore.saveItemsetCounts(itemsetCounts, function(e) {
			dataminerStore.close()
		//})

		console.log(itemsetCounts, 'numofitemsets', Object.keys(itemsetCounts).length)
		console.log('should be', Math.pow(2, txn.length))
	})
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



var extend3 = function(itemset, alphabet, callback) {
	
	var q = async.queue(function (task, callback) {
		console.log('hello ' + task.name);
		callback();
	}, 2);
}


var extend2 = function(itemsets, alphabet, callback) {

	console.log('extend2', itemsets.length)
	var extendedSets = []

	async.each(
		itemsets,
		function(itemset, next) {
			increase(itemset)
			var newSets = extendByAlphabet(itemset, alphabet)
			
			newSets.forEach(function(set) {
				extendedSets.push(set)
			})
			next(null)
		}, 
		function(e) {
			
			var len = extendedSets.length
			itemsets.splice(0)
			itemsets = null

			if((len * alphabet.length) > 2000000) {
				console.log('extended itemsets', extendedSets.length, 'insert into db')
				dataminerStore.addItemsets(extendedSets, function(err) {
					err && console.log(err)
					readAndExtend(alphabet, callback)
				})
			} 
			else if(len > 0) {
				console.log('extended itemsets', extendedSets.length, 'use ram')

				extend2(extendedSets, alphabet, callback)
			} 
			else {
				async.waterfall([
					function(cb) {
						dataminerStore.readItemsets(cb)		
					}, 
					function(itemsets, cb) {

						if(itemsets.length > 0) {
							console.log('not yet done. we have more data in db')
							extend2(itemsets, alphabet, callback)
						}
						else {
							callback(null)
						}
					}
				])
				
			}
		}
	)
}





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








var extendMem = function(itemsets, alphabet) {
	itemsets.forEach(function(itemset) {
		increase(itemset)
		var newSets = extendByAlphabet(itemset, alphabet)
		if(newSets.length > 0) {
			itemsets = null
			extendMem(newSets, alphabet)
		}
	})			
}







var extend = function(alphabet, callback) {
	
	function ext(e, itemsets) {
		if(itemsets.length == 0) { 
			callback(null) 
		} else {
			async.eachSeries(
				itemsets,
				
				function(itemset, next) {
					increase(itemset)
					var newSets = extendByAlphabet(itemset, alphabet) 
					dataminerStore.addItemsets(newSets, next)
				},
				
				function(err) {
					dataminerStore.readItemsets(ext)
				}
			);
		}			
	}
	
	//ext(null, alphabet.map(function(item) {return [item]}))
	dataminerStore.readItemsets(ext)	
}










