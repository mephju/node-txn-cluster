var help = require('../help')
var assert = require('assert')

describe('help works - ', function() {

	it('nMaxIndices works', function() {
		var array = [1,10,2,20,3,30,4,40,5,50]
		var res = help.nMaxIndices(array, 5)

		assert.deepEqual(res, [9,7,5,3,1])

	})
})