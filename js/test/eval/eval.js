
var help		= require('../../help')

var recommender = require('../../recommend/app')
var assert 		= require('assert')
var async		= require('async')
var eval 		= require('../../eval/eval')
var baseline 	= require('../../eval/most-popular')
var measure	 	= require('../../eval/measure')
var config 		= require('../../config')

config.BASELINE_ON = true

describe('Initialize recommender', function() {
	this.timeout(50000)
	it('init recommender', function(done) {
		recommender.init(done)
	})

	it('init baseline', function(done) {
		baseline.init(done)
	})
})



describe('recommender and baseline', function() {
	
	var txn = [1,2,3,4,5,6,7,8,9]
	var sessionEnd = txn.slice(4)
	var baselineItems = [11,12,13,8,9]
	var recommendations = [11,12,13,8,9]


	describe('evaluation', function() {
		it('finds 2 hits in the recommendations', function() {
			var res = measure.getHitsVs(sessionEnd, recommendations, baselineItems)	
			assert.equal(res.hitsR, 2)
		})

		it('counts multiple occurences as multiple hits', function() {
			var res = measure.getHitsVs([2,2,3,8,8], recommendations, baselineItems)	
			assert.equal(res.hitsR, 2)
			assert.equal(res.hitsB, 2)
		})
			
	}) 

	it('hit count works', function() {
		var res = measure.getHitsVs(sessionEnd, recommendations, baselineItems)	
		assert.equal(res.hitsR, res.hitsB)
		assert.equal(res.hitsR, 2)
	})


	it('evaluating single txn works', function() {
		var prec = eval.test.evalTxn(txn, baselineItems)
		console.log(prec)
		assert.equal(prec.precB, 3/4)
	})


	it('evaluating multiple txns works', function() {
		var txnRows = [{
			txn_id:1,
			item_ids:[1,2,3,4,5,6,7,8,9]
		}, {
			txn_id:2,
			item_ids:[1,2,3,4,5,6,7,8,9]
		}];

		var prec = eval.evaluate(txnRows, baselineItems)
		assert.equal(prec.precB, 3/4)
	})



})