require('../../init')
var RuleMiner 		= require('./RuleMiner')
var pruner 			= require('./apriori-prune')
var candidates 		= require('./apriori-candidates')
var count 			= require('./apriori-count')


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

Apriori.prototype.algorithm = function(txns, done) {
	log('Apriori', txns.length)
	txns.forEach(function(txn, i) {
		txns[i] = help.toItemset(txn['item_ids'])
	})
	txns = txns.filter(function(txn,i) {
		return txn.length > 1
	})

	log('Apriori after', txns.length)

	var self = this
	async.waterfall([
		function(next) {
			self.findFrequentItemsets(txns, next)
		},
		function(store, next) {
			var rules = self.miner.findRules(store)
			next(null, rules)
		},
		function(rules, next) {
			done(null, rules)
		}
	], done)
}


Apriori.prototype.findFrequentItemsets = function(txns, done) {
	log('findFrequentItemsets in txns', txns.length)
	
	var self = this
	async.waterfall([
		function(next) {
			self.initApriori(txns, next)
		},
		function(store, next) {
			log.red('after initApriori')
			self.iterate(store, txns, done)
		}
	], done)
	
	
	
}





Apriori.prototype.initApriori = function(txns, done) {
	console.log('initApriori')
	var store = [{}, {}]
	

	txns.forEach(function(txn) {
		txn.forEach(function(itemId) {
			increment(store[1], itemId)
		})
	})	

	this.prune(store[1], function() {
		log.red('pruning done')
		done(null, store)
	})
}


var increment = function(obj, key) {
	if(!obj[key]) { obj[key] = 0 } 
	obj[key]++
}


Apriori.prototype.iterate = function(store, txns, done) {
	log.blue('start iterations')
	var self = this
	var k = 1

	async.whilst(
		function() { 
			return _.size(store[k]) > 0 
		},
		function(next) {
			k++
			self.iteration(store, txns, k, next)
		},
		function(err) {
			store.pop() //remove last element since it is an empty {}
			done(err, store)
		}
	);
}


Apriori.prototype.iteration = function(store, txns, k, done) {

	log.red('apriori.iteration', k)

	store.push({})

	var self = this
	var useCores = self.dataset.config.USE_CORES

	async.waterfall([
		function(next) {		
			candidates.genCandidates(store, k, useCores, next)
		},
		function(candidates, next) {
			count.countItemsets(store[k], txns, candidates, useCores, next)
		},
		function(counts, next) { 
			self.prune(counts, done)
		}
	], done)	
}




Apriori.prototype.prune = function(counts, done) {

	log.blue('prune')

	pruner.prune({
		counts: 		counts,
		MIN_SUPPORT: 	this.dataset.config.MIN_SUPPORT,
		USE_CORES: 		this.dataset.config.USE_CORES
	}, function(err, counts) {
		log.blue('done pruning', Object.keys(counts).length)
		done(err, counts)
	})

}
