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
	txns = txns.filter(function(txn) {
		return txn.length > 20 && txn.length < 30
	})

	var store = this.findFrequentItemsets(txns)
	var rules = this.miner.findRules(store)
	return rules
}


Apriori.prototype.findFrequentItemsets = function(txns) {
	log('findFrequentItemsets in txns', txns.length)
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
		if((c%100) === 0) log.write('.')
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
	var keys = Object.keys(store[k-1]) //all keys of level k-1
	var frequent = keys.map(function(key) {
		return help.textToNumArray(key)
	})

	log('apriori.frequent', frequent.length)
	//console.log('apriori.frequent', frequent)

	var len = frequent.length
	for(var i=0; i<len; i++) {
		
		for(var h=i+1; h<len; h++) {
			
			var c = this.mergeSets(frequent[i], frequent[h])
			
			if(c.length === k && !candidates.hasArray(c)) { 
				var subsets = this.makeSubsets(c, k-1)
				if(this.areSetsIn(subsets, frequent)) {
			
					candidates.push(c)
				}
			}
		}
	}

	console.log('apriori.genCandidates done.. found', candidates.length, k)

	return candidates
}

/**
 * Creates a candidate by merging set1 and set2.
 * 
 */
Apriori.prototype.mergeSets = function(set1, set2) {
	
	var newSet = set1.slice()
	for(var i=0,len=set2.length; i<len; i++) {
		this.mergeInto(newSet, set2[i])
	}
	//log('mergeSets', set1, set2, newSet)
	return newSet
}

//Find position in 'set' where new value should be inserted
Apriori.prototype.mergeInto = function(set, value) {
	//log('mergeInto')
	for(var i=0,len=set.length; i<len; i++) {
		if(value === set[i]) {
			return
		} 
		if(set[i] > value) {
			// at position i do not remove any elements but insert 'value'
			return set.splice(i, 0, value) 
		}
	}
	set.push(value)	
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
	var key = 0
	var keys = Object.keys(counts)
	for(var i=0,len=keys.length; i<len; i++) {
		key = keys[i]
		if((i++ % 2000) === 0) log.write('p' + this.dataset.config.MIN_SUPPORT)
		if(counts[key] < this.dataset.config.MIN_SUPPORT) {
			delete counts[key]
		}
	} 
}
