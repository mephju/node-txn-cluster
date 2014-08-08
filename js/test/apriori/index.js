var config		= require('../../config')
var help		= require('../../help')
var assert 		= require('assert')
var should		= require('should')

var async		= require('async')
var _			= require('lodash')

var apriori = require('../../apriori/index').test


describe('apriori', function() {

	config.MIN_SUPPORT = 1
	var store = null
	var txns = [
		[1,2,3],
		[1,2,5],
		[1,2,5]
	];

	it('initApriori() counts items correctly', function() {
	
		store = apriori.initApriori(txns)

		store[1]['1'].should.equal(3)
		store[1]['2'].should.equal(3)
		store[1]['3'].should.equal(1)
		store[1]['5'].should.equal(2)

	})



	it('prune() removes entries not satisfying MIN_SUPPORT', function() {
		config.MIN_SUPPORT = 3
		apriori.prune(store[1])
		Object.keys(store[1]).length.should.equal(2)
		store[1]['1'].should.equal(3)
		store[1]['2'].should.equal(3)
	})

	it('iteration()', function() {
		config.MIN_SUPPORT = 1

		apriori.iteration(store, txns, 2)
		store[2].should.eql({'1,2':3})
	})

	it('increment() works for existing and non existing keys in object', function() {
		var obj = {} 
		apriori.increment(obj, 'key')
		obj.key.should.equal(1)
		apriori.increment(obj, 'key')
		obj.key.should.equal(2)
	})

	it('makeSubsets() ', function() {
		var itemset = [1,2,3,4,5,6,7,8,9]
		var subsets = apriori.makeSubsets(itemset, 5)

		subsets.length.should.equal(5)

	})


	it('areSetsIn confirms that all sets of one array are also contained in another array', function() {
		var set1 = [
			[1,2,3],
			[2,3,4]
		];
		var set2 = [
			[1,2,3],
			[2,3,4],
		];

		var result = apriori.areSetsIn(set1, set2)
		result.should.equal(true)
		set1.push([3,4,5])
		result = apriori.areSetsIn(set1, set2)
		result.should.equal(false)

	})


	it('genCandidates()', function() {
		config.MIN_SUPPORT = 1
		
		var store = []
		var txns = [
			[1,2,3,4],
			[1,2,3]
		];
		
		store.push({})  //k = 0
		store.push({	//k = 1
			'1':2,
			'2':2,
			'3':2,
			'4':1
		})

		store.push({	//k = 2
			'1,2':2,
			'1,3':2,
			'1,4':1,
			'2,3':2,
			'2,4':1,
			'3,4':1
		})
		//console.log(candidates)
		var truth = [
			[1,2,3],
			[1,2,4],
			[1,3,4],
			[2,3,4]
		];
		



		var candidates = apriori.genCandidates(store, 3)
			
		candidates.length.should.equal(4)

		truth.forEach(function(item, i) {
			help.arrayContains(candidates, item).should.be.exactly(true)
		})

		var store = [ {}, { '1': 3, '2': 3 }]
		var candidates = apriori.genCandidates(store, 2)
	})


	it('algorithm', function() {
		config.MIN_SUPPORT = 2
		var txns = [
			[1,2,3,4],
			[1,2,3]
		];


		var result = apriori.algorithm(txns)
		
		result[0].should.eql({})
		result[1].should.eql({ '1': 2, '2': 2, '3': 2 })
		result[2].should.eql({ '1,2': 2, '1,3': 2, '2,3': 2 })
		result[3].should.eql({ '1,2,3': 2 })

	})


	
})


//console.log(_.isEqual([1,2], [1,2]))