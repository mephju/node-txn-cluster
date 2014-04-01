var lev = require('../sim-levenshtein')
var assert = require('assert')




describe('levenshtein', function() {

	it('same sequences have distance of 0', function() {
		assert.equal(0, lev.distance([1,2,3,4,5], [1,2,3,4,5]))
	})
	it('should compute distance of 2', function() {
		assert.equal(2, lev.distance([1,2,3,4,5], [1,4,5,4,5]))
	})
})