var should = require('should')
var asy = require('./asy')

describe('eachChain()', function() {
	it('should stop on first error thrown', function(done) {
		var count = 0
		asy.eachChain(
			[1,2,3],
			function(num, next){
				console.log('i should onlyshow once')
				count++
				next('error')
			},
			function(next) {
				console.log('test')
			},
			function(err){
				count.should.equal(1)
				count.should.not.equal(3)
				done()
			}
		);
	})
})