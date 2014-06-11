var help = require('../help')
var isValid = function() {

	for(var i=0; i<arguments.length; i++) {
		var matrix = arguments[i]

		if(!isValidMatrix(matrix)) {
			console.log('matrix is invalid')
			return false;
		}
	}

	return true

}

var isValidMatrix = function(matrix) {
	var len = matrix.length
	for(var i=0; i<len; i++) {

		for(var j=0; j<matrix.length; j++) {
			var item = matrix[i][j]
			if(item === null || isNaN(item)) {
				console.log('matrix invalid', i, j, item)
				return false;
			}
		}
	}
	return true
}


/**
 * If rowsum is high and absolute values in transMatrix are low
 * all values in numRecomms will be 0. In order to still have the cluster
 * contributing items, we set five higest values to 1.
 * @param  {[type]} matrix [description]
 * @return {[type]}        [description]
 */
var sanitizeMatrix = function(matrix) {
	console.log('sanitizeMatrix', matrix.length)
	var len = matrix.length
	for(var i=0; i<len; i++) {
		var row = matrix[i]
		var rowSum = help.arraySum(row)

		if(rowSum < 5) {
			var maxIndices = help.nMaxIndices(matrix[i], config.N)
			maxIndices.forEach(function(maxIndex, i) {
				row[maxIndex] = 1
			})
			console.log('sanitized row', i, 'rowsum', help.arraySum(row))

		}
	}
	return matrix
}


exports.isValid = isValid
exports.sanitizeMatrix = sanitizeMatrix