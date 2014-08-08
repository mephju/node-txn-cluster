var config		= require('../../config')
var help		= require('../../help')
var assert 		= require('assert')
var should		= require('should')

var async		= require('async')
var _			= require('lodash')

var apriori = require('../../apriori/index').test
var assoc = require('../../apriori/assoc').test

describe('assoc', function() {

	it('findRules() simple', function() {
		config.MIN_SUPPORT = 1
		var txns = [
			[1,2,3,4],
			[1,2,3],
			[1,5,6],
		];
		
		var store = apriori.algorithm(txns)
		//console.log(store)
		var rules = assoc.findRules(store)

		var rulesOf5 = rules['5']
		rulesOf5.length.should.equal(3)

		rulesOf5.forEach(function(item, i) {
			item.s.should.equal(1)
			item.c.should.equal(1)
		})
	})

	it('findRules() more advanced', function() {
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

		
		var rulesOf5 = rules['5']
		rulesOf5.length.should.equal(4)

		rulesOf5[0].consequent.should.eql([7])
		rulesOf5[0].c.should.equal(2/3)
		for(var i=1; i<rulesOf5.length; i++) {
			rulesOf5[i].c.should.equal(1/3)
		}
	})

	
})
