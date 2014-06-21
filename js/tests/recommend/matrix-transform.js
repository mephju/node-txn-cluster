var config		= require('../../config')
var help		= require('../../help')
var assert 		= require('assert')
var async		= require('async')

var matrixTransform 	= require('../../recommend/matrix-transform').test
var transMatrix 		= require('./matrix-transform-trans-matrix').transMatrix()
var transMatrix2 		= require('./matrix-transform-trans-matrix').transMatrix()






describe('adjustRowSumToN', function() {

	var matrix = [
		[1,2,0,0,0],
		[1,0,3,0,0],
		[1,2,0,0,0],
		[9,3,3,1,0]
	];

	// it('', function() {
	// 	var row = matrixTransform.adjustRowSum([9,3,3,1,0])
	// 	var rowSum = help.arraySum(row)
	// 	//console.log('after adjustRowSum', rowSum, row)
	// 	assert.equal(5, rowSum)

	// })

	it('works on single rows', function() {
		
		matrix.forEach(function(row) {
			matrixTransform.adjustRowSum(row)

			var sum = help.arraySum(row)
			// console.log(row, sum)
			assert.equal(config.N, sum)
		})

			
	})
		

	

	it('adjusts row sums to N', function() {

		matrixTransform.adjustRowSumsToN(matrix)
		
		matrix.forEach(function(row,i ) {
			var sum = help.arraySum(row)
			assert.equal(sum, config.N, row)
		})
	})

		
})



describe('reduceArray', function() {
	it('reduces each val in row to be less than a MAX value', function() {

		var row 	= [70,10,5,5,10]	
		var total 	= help.arraySum(row)
		var max 	= Math.round(config.MAX_CONTRIBUTION * total)
		
		matrixTransform.reduceArray(row)
		
		row.forEach(function(val) {
			assert.equal(val <= max, true)
		})			
		
	})
})


describe('byRank', function() {
	it('nullifies all values except for N per row', function() {
		transMatrix = require('./matrix-transform-trans-matrix').transMatrix()
		matrixTransform.byRank(transMatrix)
		transMatrix.forEach(function(row) {
			//console.log(help.arraySum(row))
			var nonNulls = help.nMaxIndices(row, config.N)
			row.forEach(function(val,i) {
				var res = val === 0 || nonNulls.indexOf(i) !== -1
				assert.equal(true, res)
			})
		})
	})



	it('only keeps N highest cluster contributors and sets all others to 0', function() {
		
		var transformed = require('./matrix-transform-trans-matrix').transMatrix()
		var original 	= require('./matrix-transform-trans-matrix').transMatrix()
		
		transformed = matrixTransform.byRank(transformed)

		transformed.forEach(function(row, i) {
			var maxIndicesTransformed 	= help.nMaxIndices(transformed[i], config.N)
			var maxIndicesOriginal 		= help.nMaxIndices(original[i], config.N)
			
			maxIndicesOriginal.forEach(function(val) {
				var res = maxIndicesTransformed.indexOf(val) >= 0
				if(!res) {
					console.log(maxIndicesOriginal, maxIndicesTransformed)
				}
				assert.equal(true, res, val)
			})

		})
	})
})


describe('numRecommsByRank', function() {
	it('makes each row sum up to config.N', function() {
		transMatrix = require('./matrix-transform-trans-matrix').transMatrix()
		transMatrix = matrixTransform.numRecommsByRank(transMatrix)
		transMatrix.forEach(function(row) {
			assert.equal(help.arraySum(row), config.N)
		})
	})
})
