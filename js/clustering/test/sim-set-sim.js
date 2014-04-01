var setsim = require('../sim-set-sim')
var assert = require('assert')



describe('sim-set-sim', function() {


	it('same sequences have similarity of 1', function() {
		var sim = setsim.setSim([1,2],[1,2])
		assert.equal(1, sim)
	})

	it('should have similarity of 0.5', function() {
		var sim = setsim.setSim([1,2],[1])
		assert.equal(0.5, sim)
	})

	it('should have similarity of 0', function() {
		var sim = setsim.setSim([1,2,3],[4])
		assert.equal(0, sim)
	})	

	it('intersection set should be greater than 0', function() {
		var a = [14531, 14530, 14525, 14521, 14520]
		var b = [14523, 14522, 14521, 14520, 14519]
		
		var sim = setsim.setSim(a, b)
		var intersection = setsim.intersect(a,b)
		console.log(intersection)
		assert.equal(true, intersection.length>0)
		//assert.equal(true, sim.length>0)
	})
})