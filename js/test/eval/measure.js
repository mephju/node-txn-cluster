var help		= require('../../help')
var assert 		= require('assert')
var should 		= require('should')
var async		= require('async')
var measure 	= require('../../eval/measure')
var config 		= require('../../config')


describe('should find correct number of hits', function() {
	config.BASELINE_ON = true
	var sessionEnd = [1,2,3,4,5,6,7,8]
	var realRecomms = [1,2,3,11,12]
	var baselineRecomms = [11,12,1,2,3]
	
	it('should find 3 hits which should translate to precision of 3/#recommendations ', function() {
		var hits = measure.getHitsVs(
			sessionEnd, 
			realRecomms, 
			baselineRecomms
		);

		console.log(hits)

		assert.equal(3/baselineRecomms.length, hits.hitsB)
		assert.equal(3/realRecomms.length, hits.hitsR)
	})

	it('repeated items in the relevant set should cause repeated hits', function() {
		var relevant = [1,2,2,4,5]
		var retrieved = [0,2,6,7,8]
		var baselineRecomms = [8,8,8,8,8]

		var hits = measure.getHitsVs(
			relevant, 
			retrieved, 
			baselineRecomms
		);

		hits.hitsR.should.equal(2/retrieved.length)
	})
	it('repeated items in the retrieved set should NOT cause repeated hits', function() {
		var relevant = [1,2,3,4,5]
		var retrieved = [2,2,2,2,8]
		var baselineRecomms = [8,8,8,8,8]

		var hits = measure.getHitsVs(
			relevant, 
			retrieved, 
			baselineRecomms
		);

		hits.hitsR.should.equal(1/retrieved.length)
	})
})