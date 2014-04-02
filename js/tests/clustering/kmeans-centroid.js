var assert = require('assert')
var kmCentroid = require('../../clustering/kmeans-centroid')
var Centroid = kmCentroid.Centroid



describe('kmeans-centroid', function() {
	var featureVector = [
		[1,2,3],
		[4,5]
	];
	
	var allseqs = [
		[1,2,3]
	];


	var centroid = new Centroid(0, featureVector)
	centroid.init()
	
	it('distance is greater 0', function() {
		var d = centroid.distanceLevenshtein(allseqs)
		console.log(d)
		assert.equal(d > 0, true)
	})

	it('distance is 0', function() {
		var c2 = new Centroid(0, allseqs)
		c2.init()
		c2.vector[0] = 1
		var d = c2.distanceLevenshtein(allseqs)
		console.log(d)
		assert.equal(d, 0)	
	})


	it('distance is 1/3', function() {
		var c = new Centroid(0, allseqs)
		c.init()
		c.vector[0] = 1
		var d = c.distanceLevenshtein([[1,2]])
		assert.equal(d, 1/3)	
	})


	it('distance is 1', function() {
		var c = new Centroid(0, allseqs)
		c.init()
		c.vector[0] = 1
		var d = c.distanceLevenshtein([[5,6,7]])
		assert.equal(d, 1)	
	})


	it('distance is 2', function() {
		var c = new Centroid(0, featureVector)
		c.init()
		c.vector[0] = 1
		c.vector[1] = 1
		var d = c.distanceLevenshtein(featureVector)
		assert.equal(d, 2)	
	})
})