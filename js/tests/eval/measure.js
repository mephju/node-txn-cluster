var help		= require('../../help')

var assert 		= require('assert')
var async		= require('async')

var measure 	= require('../../eval/measure')

describe('should find correct number of hits', function() {
	var sessionEnd = [1,2,3,4,5,6,7,8]
	var realRecomms = [1,2,3,11,12]
	var baselineRecomms = [11,12,1,2,3]
	it('should find 3 hits', function() {
		var hits = measure.getHitsVs(
			sessionEnd, 
			realRecomms, 
			baselineRecomms
		);


		assert.equal(3, hits.hitsB)
		assert.equal(3, hits.hitsR)
	})
})