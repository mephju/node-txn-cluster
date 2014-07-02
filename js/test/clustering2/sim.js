var sim = require('../../clustering2/sim').test

var help		= require('../../help')

var assert 		= require('assert')
var async		= require('async')


describe('sim module', function() {
	describe('- Jaccard Bigram Similarity', function() {
		it('computes similarity as 1/3', function() {
			var array1 = [5,6,7] 
			var array2 = [5,6,8]

			var result = sim.jaccardBigram(array1, array2)
			assert.equal(result, 1/3)
		})

		it('computes similarity as 1/2', function() {
			var array1 = [5,6,8,7,5,6] 
			var array2 = [5,6,8]
			var result = sim.jaccardBigram(array1, array2)
			assert.equal(result, 0.5)
		})
	})

	it('works', function() {
		var array1 = [
			858,300,2003,3593,1722,1248,1250,2858,3730,
			1997,951,2948,1282,1252,3435,913,922,1617,
			541,2066,1267,930,2987,3364,2186,3683,3030,910,947,
			2973,1188,1276,916,2289,1180,955,1136,2997,905,1394,
			898,1294,3037,3072,1265,2138,260,2174,2872,1097,1073,
			2100,2,2005,923,528,1237,912,1217,3469,908,1207,1225,
			318,971,926,1254,1262,1198,1204
		]
		var array2 = [
			70,1620,1627,1805,434,81,1804,170,2002,1377,3301,3729,
			2605,2616,1918,707,2126,762,153,2986,3717,463,1562,1647,
			487,1250,1204,2028
		]

		var simJaccard = sim.jaccard(array1, array2)
		var simLevenshtein = sim.levenshtein(array1, array2)
		var simJaccLev = sim.jaccLev(array1, array2)

		console.log(1-simJaccard, simLevenshtein, simJaccLev)
	})
})