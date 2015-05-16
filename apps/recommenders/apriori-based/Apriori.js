require('../../init')
var RuleMiner = require('./RuleMiner')

function Apriori(dataset) {
	this.dataset = dataset
	this.miner = new RuleMiner(dataset)
	this.filename = dataset.resultPath
	+ 'apriori-rules-' 
	+ dataset.name 
	+ '-cross-validation-run-' 
	+ dataset.config.CROSS_VALIDATION_RUN  
	+ '.json'
}

module.exports = Apriori


Apriori.prototype.algorithm = function(txns) {
	log('Apriori', txns.length)
	txns.forEach(function(txn, i) {
		txns[i] = help.toItemset(txn['item_ids'])
	})

	var store = this.findFrequentItemsets(txns)
	var rules = this.miner.findRules(store)
	return rules
}


Apriori.prototype.findFrequentItemsets = function(txns) {

	var k = 1
	
	var store = this.initApriori(txns)

	while(_.size(store[k]) > 0) {
		k++
		this.iteration(store, txns, k)
	}
	store.pop() //remove last element since it is an empty {}
	return store
}


Apriori.prototype.initApriori = function(txns) {
	console.log('initApriori')
	var store = [{}, {}]
	txns.forEach(function(txn) {
		txn.forEach(function(itemId) {
			increment(store[1], itemId)
		})
	})	
	this.prune(store[1])
	return store
}


increment = function(obj, key) {
	if(!obj[key]) { obj[key] = 0 } 
	obj[key]++
}


Apriori.prototype.iteration = function(store, txns, k) {

	console.log('apriori.iteration', k)

	store.push({})

	var candidates = this.genCandidates(store, k)

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

	this.prune(store[k])
}

/**
 * Ggenerates all candidates for round k by uniting all itemsets of round k-1 
 * with each other. (pair wise)
 * @param  {[type]} store [description]
 * @param  {[type]} k     [description]
 * @return {[type]}       [description]
 */
Apriori.prototype.genCandidates = function(store, k) {

	console.log('apriori.genCandidates', k)


	var candidates = []
	var keys = Object.keys(store[k-1])
	var frequent = keys.map(function(key) {
		return help.textToNumArray(key)
	})

	console.log('apriori.frequent', frequent.length)
	//console.log('apriori.frequent', frequent)

	var len = frequent.length
	for(var i=0; i<len; i++) {
		//console.log(i)
		for(var h=i+1; h<len; h++) {
			
			var c = this.mergeSets(frequent[i], frequent[h])
			
			if(c.length === k) {
			
				if(!candidates.hasArray(c)) { 
					var subsets = this.makeSubsets(c, k-1)
					if(this.areSetsIn(subsets, frequent)) {
				
						candidates.push(c)
					}
				}
			}
		}
	}

	console.log('apriori.genCandidates done.. found', candidates.length, k)

	return candidates
}


Apriori.prototype.mergeSets = function(set1, set2) {
	var newSet = set1.slice()
	for(var i=0,len=set2.length; i<len; i++) {
		var pos = this.findInsertPos(newSet, set2[i])
		if(pos !== -1) {
			newSet.splice(pos, 0, set2[i])
		}
	}
	return newSet
}

Apriori.prototype.findInsertPos = function(set, value) {
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



Apriori.prototype.areSetsIn = function(sets, frequentSets) {
	//console.log('areSetsIn')
	for(var i=0; i<sets.length; i++) {
		if(!frequentSets.hasArray(sets[i])) { return false }
	}
	return true
}

Apriori.prototype.makeSubsets = function(itemset, size) {
	//console.log('makeSubsets')
	var subsets = []
	for(var i=0; i+size<=itemset.length; i++) {
		subsets.push(itemset.slice(i, i+size))
	}
	return subsets
}


Apriori.prototype.prune = function(counts) {
	console.log('prune')
	for(var key in counts) {
		if(counts[key] < this.dataset.config.MIN_SUPPORT) {
			delete counts[key]
		}
	} 
}



// exports.init = init
// exports.recommend = recommend
// exports.reset = reset	

// exports.test = {

// 	init:init,
// 	prune:prune,
// 	makeSubsets: makeSubsets,
// 	algorithm: algorithm,
// 	genCandidates: genCandidates,
// 	areSetsIn: areSetsIn,
// 	iteration: iteration,
// 	initApriori: initApriori,
// 	increment: increment,
// 	findInsertPos: findInsertPos,
// 	mergeSets: mergeSets
// }

//work()
/*

var example = [
	{}, 						//0
	{ '1':10, '2':20, '3':5 }, 	//1
	{ '1,2':5, '2,3': 5 }		//2
];

 */
