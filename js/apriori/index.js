var _			= require('lodash')
var async		= require('async')
var db 			= require('./db')
var txnDb		= require('../transactions/db')
var config		= require('../config')
var help 		= require('../help')
var Recommender = require('./recommend').Recommender
var assoc 		= require('./assoc')

var fallbackItems = []

var init = function(popularFallbackItems, done) {

	fallbackItems =  popularFallbackItems
	
	async.waterfall([
		function(next) {
			db.getTxnsAsSets(next)
		},
		function(transactions, next) {
			var store 	= algorithm(transactions);
			var rules 	= assoc.findRules(store)

			var recommender = new Recommender(rules)


			done(null, recommender)
		}
	], done)
}


var reset = function() {}
var recommend = function(item) {
	var recs = recommender.getRecommendations(item)

	for (var i=0; i<fallbackItems.length && recs.length<config.N; i++) {
		recs.push(fallbackItems[i])
	};

	return recs
}








var algorithm = function(txns) {

	var k = 1
	
	var store = initApriori(txns)

	while(_.size(store[k]) > 0) {
		k++
		iteration(store, txns, k)
	}
	store.pop() //remove last element since it is an empty {}
	return store
}


var initApriori = function(txns) {
	var store = [{}, {}]
	txns.forEach(function(txn) {
		txn.forEach(function(itemId) {
			increment(store[1], itemId)
		})
	})	
	prune(store[1])
	return store
}


var increment = function(obj, key) {
	if(!obj[key]) {
		obj[key] = 0
	} 
	obj[key]++
}


var iteration = function(store, txns, k) {
	store.push({})

	var candidates = genCandidates(store, k)

	candidates.forEach(function(candidate, i) {
		var key = candidate.toString()
		store[k][key] = 0
		
		txns.forEach(function(txn, i) {
			var minLen = candidate.length
			if(_.intersection(txn, candidate).length === minLen) {
				store[k][key]++
			}
		})
	})

	prune(store[k])
}

/**
 * Ggenerates all candidates for round k by uniting all itemsets of round k-1 
 * with each other. (pair wise)
 * @param  {[type]} store [description]
 * @param  {[type]} k     [description]
 * @return {[type]}       [description]
 */
var genCandidates = function(store, k) {

	var candidates = []
	var frequent = Object.keys(store[k-1]).map(function(key) {
		return help.textToNumArray(key)
	})
	frequent.forEach(function(itemset1, i) {
		frequent.forEach(function(itemset2, h) {
			if(i !== h) {
				var c = _.union(itemset1, itemset2).sort(help.cmp)
				var subsets = makeSubsets(c, k-1)
				if(c.length === k && !help.arrayContains(candidates, c) && areSetsIn(subsets, frequent)) {
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

			if(_.isEqual(frequentSets[h], sets[i])) {
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
	for(var i=0; i+size<=itemset.length; i++) {
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



exports.init = init
exports.test = {
	init:init,
	prune:prune,
	makeSubsets: makeSubsets,
	algorithm: algorithm,
	genCandidates: genCandidates,
	areSetsIn: areSetsIn,
	iteration: iteration,
	initApriori: initApriori,
	increment: increment
}

//work()
/*

var example = [
	{}, 						//0
	{ '1':10, '2':20, '3':5 }, 	//1
	{ '1,2':5, '2,3': 5 }		//2
];

 */