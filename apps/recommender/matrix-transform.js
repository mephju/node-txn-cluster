var help = require('../help')
var async = require('async')
var config = require('../config')


var numRecommsByShare = function(transMatrix) {
	var matrix = transMatrix.map(function(row, i) {
		var rowSum = help.arraySum(row)
		return row.map(function(val) {
			if(val > 0) {
				return Math.round(config.N * (val / rowSum))	
			}
			return 0
		})
	})
	//return matrix
	return adjustRowSumsToN(matrix)
}




/**
 * Each row of matrix must add up to N
 * @param  {[type]} transMatrix [description]
 * @return {[type]}             [description]
 */
var adjustRowSumsToN = function(transMatrix) {
	transMatrix.forEach(adjustRowSum)
	return transMatrix
}



var adjustRowSum = function(row) {

	var rowSum 	= help.arraySum(row)
	var diff 	= (config.N-rowSum)
	
	//console.log('adjustRowSum', rowSum, row, diff)

	if(diff === 0) { return row }

	var maxIndices = help.nMaxIndices(row, config.N)

	//console.log(maxIndices)

	if(diff > 0) {		
		for(var i=0; i<diff && i<maxIndices.length; i++) {
			var maxIdx = maxIndices[i]	
			row[maxIdx]++
		}

	} 
	else if(diff < 0) {
		//maxIndices.reverse()
		for(var i=0; i<Math.abs(diff) && i<maxIndices.length; i++) {
			var maxIdx = maxIndices[i]	
			//console.log(row[maxIdx])
			if(row[maxIdx] > 0) { 
				row[maxIdx]-- 
			}
		}	
	}

	return adjustRowSum(row)
	
}


// 
// Find N highest values in each row of matrix.
// Rank them according to their value.
// Adjust the values to number of recommendations
// 
var numRecommsByRank = function(transMatrix) {
	byRank(transMatrix)
	return numRecommsByShare(transMatrix)
}



/**
 * Find N highest values in each row.
 * Find N indices of N highest values.
 * Nullify all values in matrix.
 * Modify high values so that none of them is higher 
 * than 60% the total amount .
 * Write those values back to the matrix.
 * @param  {[type]} transMatrix [description]
 * @return {[type]}             [description]
 */
var byRank = function(transMatrix) {
	return transMatrix.map(function(row, i) {
		var maxIndices 	= help.nMaxIndices(row, config.N)
		var maxVals 	= maxIndices.map(function(idx) { return row[idx] })
		
		reduceArray(maxVals)
		
		row.forEach(function(val, i) { row[i] = 0 })
		
		maxIndices.forEach(function(idx, i) {
			row[idx] = maxVals[i]
		})
		return row
	})
}




//reduce values in array until none of the values
//are bigger than config.MAX_CONTRIBUTION * total
var reduceArray = function(row) {
	var total	= help.arraySum(row)
	var max 	= Math.round(config.MAX_CONTRIBUTION * total)

	for(var i=0; i<row.length; i++) {
		var val = row[i]
		if(val > max && total - (val - max)) {
			row[i] = max	
			return reduceArray(row)			
		}
	}
	return total
}



// var r = [309,3,1,1,2,5,1,1,3,1,1,1,2,1,0,3,3,0,2,1,2,1,1,3,4,0,2,1,3,0,1,2,0,3,1,3,0,1,3,2,2,4,0,0,2,2,2,4,0,2,3,2,0,4,0,1,1,2,2,3,4,3,2,1,2,2,0,3,1,0,1,2,1,1,1,1,2,1,1,1,1,2,1,0,2,2,0,2,4,2,3,0,4,2,3,1,1,0,0,3,3,2,2,0,0,2,0,2,4,6,0,2,2,1,0,0,3,1,0,2,2,3,0,1,1,3,2,1,2,0,1,1,2,1,1,1,3,2,1,0,2,3,0,2,1,1,2,2,0,0,1,1,1,0,3,0,2,1,0,1,2,2,1,3,3,1,0,1,1,0,2,3,3,3,3,1,0,0,1,1,1,1,0,2,2,0,4,2,2,0,2,0,2,4,1,2,1,3,1,2,1,1,2,2,0,1,3,5,3,1,2,2,3,0,2,0,2,0,2,1,0,2,0,3,1,0,0,1,1,1,2,0,2,0,2,1,1,0,0,1,1,1,1,6,2,0,4,0,1,2,1,2,2,0,0,2,1,3,2,1,3,2,0,0,1,0,3,3,1,0,0,3,1,1,3,2,0,0,2,1,1,0,0,1,2,3,1,1,2,2,2,0,2,1,1,1,1,2,2,2,0,1,0,2,1,5,2,2,2,2,1,0,0,0,1,1,0,2,0,0,1,4,1,1,2,0,2,1,2,0,0,3,0,0,1,0,1,1,3,1,1,5,1,1,2,5,1,1,1,1,0,2,2,2,2,3,0,1,2,1,1,4,0,0,4,1,3,1,1,0,4,3,5,2,3,1,2,1,1,1,2,0,1,0,1,3,2,4,1,2,1,4,1,1,1,1,1,2,1,1,0,2,0,3,0,3,3,1,2,2,1,1,0,0,2,1,1,0,1,1,0,2,0,3,2,0,1,0,1,1,2,0,0,2,2,0,2,2,3,2,2,0,0,1,2,4,2,1,1,1,2,4,2,1,1,1,2,0,2,1,1,2,0,0,0,1,3,0,1,2,3,0,4,2,0,2,3,0,1,0,1,0,1,3,1,1,0,4,1,2,2,1,2,2,1,5,0]
// var t = r.reduce(function(l,r) { return l+r })
// console.log(reduceRow(r, t))

exports.buildNumRecomms = numRecommsByRank
exports.test = {
	numRecommsByRank: numRecommsByRank,
	numRecommsByShare: numRecommsByShare,
	reduceArray: reduceArray,
	byRank: byRank,
	adjustRowSumsToN: adjustRowSumsToN,
	adjustRowSum: adjustRowSum
}