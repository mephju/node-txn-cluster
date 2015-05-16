
function RuleMiner(dataset) {
	this.dataset = dataset
}

module.exports = RuleMiner

RuleMiner.prototype.findRules = function(store) {

	var rules = {}
	for(var k=2; k<store.length; k++) {
		var keys = Object.keys(store[k])
		var kItemsets = keys.map(function(key) {
			return help.textToNumArray(key)
		})

		kItemsets.forEach(function(itemset) {
			addItemsetRules(itemset, store, rules)
		})
	}

	sortRules(rules)

	return rules
}

var sortRules = function(rules) {
	var antecedents = Object.keys(rules)
	antecedents.forEach(function(ante, i) {
		rules[ante] = _.chain(rules[ante])
		.sortBy('c')
		.reverse()
		.value()
	})

}



var addItemsetRules = function(itemset, store, rules) {
	
	var k = itemset.length
	var supportR = store[k][itemset.toString()]

	for(var i=0; i<k; i++) {
		var antecedent = itemset[i]
		var supportA = store[1][antecedent]
		var consequent = _.difference(itemset, [antecedent])
		var confidence = supportR / supportA

		addRule(rules, antecedent, {
			'consequent': consequent,
			'c': confidence,
			's': supportR
		})
	}
}

var addRule = function(rules, antecedent, rule) {
	if(!rules[antecedent]) {
		rules[antecedent] = []
	}
	rules[antecedent].push(rule)
}




// var rules = {
// 	'103':[{
// 		'consequent': [102,104,105],
// 		'c': 0.5,
// 		's': 8
// 	}]
// }
