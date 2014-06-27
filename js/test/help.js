var help = require('../help')
var assert = require('assert')

describe('help works - ', function() {

	it('nMaxIndices works', function() {
		var array = [1,10,2,20,3,30,4,40,5,50]
		var res = help.nMaxIndices(array, 5)



		assert.deepEqual(res, [9,7,5,3,1])

		var res = help.nMaxIndices([1,2,3,4,5], 10)

		assert.equal(res.length, 5)
		console.log(res)

	})


	describe('intersectNum(array1, array2)', function() {
		it('produces set results', function() {
			var set1 = [1,2,3,4,5]
			var set2 = [1,2,2,2,2]
			var num = help.intersectNum(set1, set2)
			assert.equal(num, 2)
		})
		it('works for array of arrays', function() {
			var set1 = [ [1,2], [3,4], [5,6], [2,3], [4,5]]
			var set2 = [ [1,2], [2,2], [2,3], [4,5] ]
			var num = help.intersectNum(set1, set2)
			assert.equal(num, 3)
		})
	})


	describe('removeNulls(array)', function() {
		it('removes nulls, undefined elements from array and shrinks it', function() {
			var array = [1, null, null, 2, 3, undefined, 4]
			var sizeAfterRemoval = 4
			help.removeNulls(array)

			assert.equal(array.length, sizeAfterRemoval, array)
			assert.deepEqual(array, [1,2,3,4])

		})
	})


	it('contains finds array in list of arrays', function() {
		assert(help.contains(
			[[1,2], [1,3]], 
			[1,3]
		));
	})
})