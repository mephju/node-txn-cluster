var _			= require('lodash')
var async		= require('async')
var db 			= require('./db')

var txnDb		= require('../transactions/db')

var config		= require('../config')
var help 		= require('../help')









var k = 1

var work = function(done) {
	var txns = null

	async.waterfall([
		function(next) {
			db.getTxnsAsSets(next)
		},
		function(transactions, next) {
			txns = transactions
			db.getFrequentItemIds(config.MIN_SUPPORT, next)
		},
		function(rows, next) {
			//rows = [{ item_id:1, count:3 }]
			
			
			var store = algorithm(txns);

			console.log(store)
			
		}
	])
}






var algorithm = function(txns) {

	var k = 1
	var store = [{}, {}]
			
	init(store, txns)

	while(_.size(store[k]) > 0) {
		k++
		store.push({})
		iteration(store, txns, k)
	}
	store.pop() //remove last element since it is an empty {}
	return store
}


var init = function(store, txns) {
	var k = 1
	txns.forEach(function(txn) {
		txn.forEach(function(itemId) {
			increment(store[k], itemId)
		})
	})	
	prune(store[k])
}


var increment = function(obj, key) {
	if(!obj[key]) {
		obj[key] = 0
	} 
	obj[key]++
}


var iteration = function(store, txns, k) {
	var candidates = genCandidates(store, k)
	
	candidates.forEach(function(candidate, i) {
		var key = candidate.toString()
		store[k][key] = 0
		
		txns.forEach(function(txn, i) {
			var minLen = candidate.length
			if(help.intersect(txn, candidate).length === minLen) {
				store[k][key]++
			}
		})
	})

	prune(store[k])
}


var genCandidates = function(store, k) {

	var candidates = []
	var frequent = Object.keys(store[k-1]).map(function(key) {
		return help.textToNumArray(key)
	})
	frequent.forEach(function(itemset1, i) {
		frequent.forEach(function(itemset2, h) {
			if(i !== h) {
				var c = _.union(itemset1, itemset2)
				var subsets = makeSubsets(c, k-1)
				if(areSetsIn(subsets, frequent)) {
					candidates.push(c)
				}
			}
		})
	})
	return candidates
}


var areSetsIn = function(sets, frequentSets) {
	for(var i=0; i<sets.length; i++) {
		var included = false
		for(var h=0; h<frequentSets.length; h++) {
			if(frequentSets[h] === sets[i]) {
				included = true
				break;
			}
		}
		if(!included) { return false }
	}
	return true
}



var makeSubsets = function(itemset, size) {
	var subsets = []
	for(var i=0; i+size<itemset.length; i++) {
		subsets.push(itemset.slice(i, i+size))
	}
	return subsets
}


var prune = function(counts) {
	for(var key in counts) {
		if(counts[key] < config.MIN_SUPPORT) {
			delete counts[key]
		}
	} 
}


exports.work = work
exports.test = {
	prune:prune,
	makeSubsets: makeSubsets,
	algorithm: algorithm,
	genCandidates: genCandidates,
	areSetsIn: areSetsIn,
	iteration: iteration,
	init: init
}

work()
/*

var example = [
	{}, 						//0
	{ '1':10, '2':20, '3':5 }, 	//1
	{ '1,2':5, '2,3': 5 }		//2
];

 */