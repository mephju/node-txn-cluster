require('../init')
var Distance = require('../trainer/similarity/distance').Distance

var should = require('should')

describe('Distance', function() {
	describe('intersect', function() {
		it('computes correct intersection', function() {
			var a1 = [1,2,3,10,90]

			Distance.intersect(a1, a1).should.equal(a1.length)
			Distance.intersect(a1, [0,4,10]).should.equal(1)
			Distance.intersect(a1, [0,4,10,110]).should.equal(1)
			Distance.intersect(a1, [-1, 0, 1,4,10,110]).should.equal(2)
			Distance.intersect([0,4,10,110], a1).should.equal(1)

		})
	})

	describe('intersectSlow', function() {
		it('computes correct intersection', function() {
			var a1 = [1,2,3,10,90]

			Distance.intersectSlow(a1, a1).should.equal(a1.length)
			Distance.intersectSlow(a1, [0,4,10]).should.equal(1)
			Distance.intersectSlow(a1, [0,4,10,110]).should.equal(1)
			Distance.intersectSlow(a1, [-1, 0, 1,4,10,110]).should.equal(2)
			Distance.intersectSlow([0,4,10,110], a1).should.equal(1)

			Distance.intersectSlow(a1, a1).should.equal(a1.length)
			Distance.intersectSlow(a1, [4,0,10]).should.equal(1)
			Distance.intersectSlow(a1, [10,4,0,110]).should.equal(1)
			Distance.intersectSlow(a1, [10, -1, 0, 1,4,110]).should.equal(2)
			Distance.intersectSlow([110,4,10,0], a1).should.equal(1)

		})
	})
})