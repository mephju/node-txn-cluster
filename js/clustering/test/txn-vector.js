var txnvec = require('../txn-vector')
var assert = require('assert')

describe('txnVector', function() {
	describe('buildVectorBatch()', function() {
		it('should have length of 1', function() {
			var txnBatch = [[1]]
			var freqSeqs = [[1]]
			
			var res = txnvec.buildVectorBatch(txnBatch, freqSeqs)

			assert.equal(1, res.length)
			assert.equal(res[0], 1)
		})

		it('should have length of 1', function() {
			var txnBatch = [[1,2,3,4,5]]
			var freqSeqs = [[1], [2]]
			
			var res = txnvec.buildVectorBatch(txnBatch, freqSeqs)
			console.log(res)
		})
	})

	describe('filterToLength()', function() {
		it('only sequences of length n remain', function() {
			var res = txnvec.filterToLength(
				[[1], [2], [3], [1,2], [2,3], [1,2,3]], 
				2
			);
			res.forEach(function(seq) {
				assert.equal(2, seq.length)
			})
			
			var res = txnvec.filterToLength(
				[[1], [2], [3], [1,2], [2,3], [1,2,3]], 
				3
			);
			res.forEach(function(seq) {
				assert.equal(3, seq.length)
			})
		})
		it('no filtering takes place if not enough sequences', function() {
			var input = [[1], [2], [1,2]]
			var out = txnvec.filterToLength(input, 3);

			assert.equal(input.length, out.length)

		})
	})
})