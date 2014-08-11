var config		= require('../../config')
var help		= require('../../help')
var assert 		= require('assert')
var should		= require('should')

var async		= require('async')
var _			= require('lodash')

var apriori 	= require('../../apriori/index').test
var assoc 		= require('../../apriori/assoc').test
var Recommender = require('../../apriori/recommend').Recommender


describe('apriori.Recommender', function() {

	it('getRecommendations()', function() {
		config.MIN_SUPPORT = 1
		var txns = [
			[1,2,3,4],
			[1,2,3],
			[1,5,6],
			[5,7],
			[5,7]
		];
		
		var store = apriori.algorithm(txns)
		//console.log(store)
		var rules = assoc.findRules(store)

		var recommender = new Recommender(rules)
		// console.log(JSON.stringify(rules, undefined, 2))

		var result = recommender.getRecommendations([5], 1)
		result.should.eql([7])

		result = recommender.getRecommendations([5], 5)
		result.length.should.equal(3)
		_.uniq(result).length.should.equal(3)

		
	})


	it('getRecommendations(session)', function() {
		config.MIN_SUPPORT = 1
		var txns = [
			[1,2,3,4],
			[1,2,3],
			[1,5,6],
			[5,7],
			[5,7]
		];
		
		var store = apriori.algorithm(txns)
		//console.log(store)
		var rules = assoc.findRules(store)

		var recommender = new Recommender(rules)
		// console.log(JSON.stringify(rules, undefined, 2))

		var result = recommender.getRecommendations([5,7], 5)
		result.length.should.equal(2)

		result = (result[0] === 1 || result[1] === 1) && (result[0] === 6 || result[1] === 6)
		result.should.equal(true)

	})
})