
var help		= require('../../help')

var recommender = require('../../recommend/index')
var assert 		= require('assert')
var async		= require('async')
var eval 		= require('../../eval/eval').test
var baseline 	= require('../../eval/most-popular')
var measure	 	= require('../../eval/measure')
var config 		= require('../../config')
var should		= require('should')
config.BASELINE_ON = true

describe('Initialize recommender', function() {
	this.timeout(50000)
	it('init baseline', function(done) {
		baseline.init(done)
	})
})



describe('eval', function() {
	
	var txn = [1,2,3,4,5,6,7,8,9]
	var baselineItems = [11,12,13,8,9]


	function Recommender(recommendations) {
		this.recommendations = recommendations
	}
	Recommender.prototype.init = function() {}
	Recommender.prototype.reset = function() {}
	Recommender.prototype.recommend = function(sessionBegin, N) {
		return this.recommendations
	}

	var recommender = new Recommender([2,3,4,5,6])


	it('computes correct precision for one txn', function() {

		var precision = eval.evalTxn(txn, baselineItems, recommender)

		//console.log(precision.precR)

		

		// var precision = eval.evalTxn(txn, baselineItems, recommender)

		

		//1/5 : 4
		//
		// 1 		:: 2,3,4,5,6  	5/5 = 1
		// 1,2 		:: 3,4,5,6,7 	4/5 = 0.8
		// 1,2,3	:: 4,5,6,7,8	3/5 = 0.6
		// 1,2,3,4 	:: 5,6,7,8,9 	2/5 = 0.4
		// 							--------
		// 							2.8
		// 							2.8/4 = 0.7
		// 
		console.log('onetxn',precision)		
		precision.precR.should.equal(0.7 )
	})

	it('evaluate() computes correct precision for 2 txns', function() {
		var txns = [
			{ item_ids:[1,2,3,4,5,6,7,8,9] },
			{ item_ids:[1,2,3,4,5,6,7,8,9] },
			{ item_ids:[1,2,3,4,5,6] }
		]
		var result = eval.evaluate(txns, baselineItems, recommender)
		var truth = (0.7+0.7+1) / 3

		console.log(result)
		result.precR.should.equal(2.4/3)
	})






})