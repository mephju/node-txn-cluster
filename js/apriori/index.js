var _			= require('lodash')
var async		= require('async')
var db 			= require('./db')
var txnDb		= require('../transactions/db')
var config		= require('../config')
var help 		= require('../help')
var Recommender = require('./recommend').Recommender
var assoc 		= require('./assoc')

console.log('loading apriori.index')

var recommender = null

var fallbackItems = []

var init = function(popularFallbackItems, done) {

	fallbackItems =  popularFallbackItems
	
	async.waterfall([
		function(next) {
			db.getTxnsAsSets(next)
		},
		function(transactions, next) {
			var store 	= algorithm(transactions);
			console.log(store)
			var rules 	= assoc.findRules(store)
			console.log(rules)
			
			console.log('setting recommender')
			recommender = new Recommender(rules)


			done(null)
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
	console.log('initApriori')
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

	console.log('apriori.iteration', k)

	store.push({})

	var candidates = genCandidates(store, k)

	for(var c=0,clen=candidates.length; c<clen; c++) {
		var candidate = candidates[c]
		var key = candidate.toString()
		store[k][key] = 0
		
		for(var t=0; t<txns.length; t++) {
			if(help.arrayInArray(txns[t], candidate)) {
				store[k][key]++
			}
		}
	}

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

	console.log('apriori.genCandidates', k)


	var candidates = []
	var keys = Object.keys(store[k-1])
	var frequent = keys.map(function(key) {
		return help.textToNumArray(key)
	})

	console.log('apriori.frequent', frequent.length)
	console.log('apriori.frequent', frequent)

	var len = frequent.length
	for(var i=0; i<len; i++) {
		//console.log(i)
		for(var h=i+1; h<len; h++) {
			
			var c = mergeSets(frequent[i], frequent[h])
			console.log(i, h, frequent[i], frequent[h], c)
			//var c = _.union(frequent[i], frequent[h], true).sort(help.cmp)
			
			if(c.length === k) {
			
				if(!candidates.hasArray(c)) { 
					var subsets = makeSubsets(c, k-1)
					if(areSetsIn(subsets, frequent)) {
					//console.log('push')
						candidates.push(c)
						//console.log('push', c)
					}
				}
			}
		}
	}

	console.log('apriori.genCandidates done.. found', candidates.length, k)

	return candidates
}


var mergeSets = function(set1, set2) {
	var newSet = set1.slice()
	for(var i=0,len=set2.length; i<len; i++) {
		var pos = findInsertPos(newSet, set2[i])
		if(pos !== -1) {
			newSet.splice(pos, 0, set2[i])
		}
	}
	return newSet
}

var findInsertPos = function(set, value) {
	for(var i=0,len=set.length; i<len; i++) {
		if(value === set[i]) {
				return -1
		} 
		if(value < set[i]) {
			return i
		}
	}	
	return set.length
}





var areSetsIn = function(sets, frequentSets) {
	//console.log('areSetsIn')
	for(var i=0; i<sets.length; i++) {
		if(!frequentSets.hasArray(sets[i])) { return false }
	}
	return true
}



var makeSubsets = function(itemset, size) {
	//console.log('makeSubsets')
	var subsets = []
	for(var i=0; i+size<=itemset.length; i++) {
		subsets.push(itemset.slice(i, i+size))
	}
	return subsets
}


var prune = function(counts) {
	console.log('prune')
	for(var key in counts) {
		if(counts[key] < config.MIN_SUPPORT) {
			delete counts[key]
		}
	} 
}



exports.init = init
exports.recommend = recommend
exports.reset = reset	

exports.test = {

	init:init,
	prune:prune,
	makeSubsets: makeSubsets,
	algorithm: algorithm,
	genCandidates: genCandidates,
	areSetsIn: areSetsIn,
	iteration: iteration,
	initApriori: initApriori,
	increment: increment,
	findInsertPos: findInsertPos,
	mergeSets: mergeSets
}

//work()
/*

var example = [
	{}, 						//0
	{ '1':10, '2':20, '3':5 }, 	//1
	{ '1,2':5, '2,3': 5 }		//2
];

 */
