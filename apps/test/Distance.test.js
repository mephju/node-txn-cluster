var Distance = require('../trainer/similarity/distance').Distance

var should = require('should')

describe('Distance', function() {
	describe('intersect', function() {
		it('computes correct intersection', function() {
			var a1 = [1,2,3,10,90]
			var a2 = [1,2,3,10,90,100]

			var num = Distance.intersect(a1, a1)
			num.should.equal(a1.length)

			Distance.intersect(a1, a2).should.equal(5)
			Distance.intersect(a1, [0,4,10]).should.equal(1)
			Distance.intersect(a1, [0,4,10,110]).should.equal(1)
			Distance.intersect(a1, [-1, 0, 1,4,10,110]).should.equal(2)
			Distance.intersect([0,4,10,110], a1).should.equal(1)

		})
	})
})