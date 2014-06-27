var sim = require('../../clustering2/sim').test

var help		= require('../../help')

var assert 		= require('assert')
var async		= require('async')


describe('sim module', function() {
	describe('- Jaccard Bigram Similarity', function() {
		it('computes similarity as 1/3', function() {
			var array1 = [5,6,7] 
			var array2 = [5,6,8]

			var result = sim.jaccardBigram(array1, array2)
			assert.equal(result, 1/3)
		})

		it('computes similarity as 1/2', function() {
			var array1 = [5,6,8,7,5,6] 
			var array2 = [5,6,8]
			var result = sim.jaccardBigram(array1, array2)
			assert.equal(result, 0.5)
		})
	})
})