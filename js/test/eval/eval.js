
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


	it('computes correct precision for one txn', function() {

		var precision = eval.evalTxn(txn, baselineItems, new Recommender([9,10,11,12,13]))

		console.log('')
		console.log(precision.precR)

		precision.precR.should.equal(1/5/4)

		var precision = eval.evalTxn(txn, baselineItems, new Recommender([2,3,4,5,6]))

		console.log(precision)		

		//1/5 : 4
		//
		// 1 		:: 2,3,4,5,6
		// 1,2 		:: 3,4,5,6,7
		// 1,2,3	:: 4,5,6,7,8
		// 1,2,3,4 	:: 5,6,7,8,9
		// 
		

	})






})