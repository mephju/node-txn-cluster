var initTransMatrix = function(size) {
	var row = new Array()
	
	for(var i=0; i<size; i++) { row[i] = 0 }
	
	return row.map(function(entry) {
		return row.slice(0)
	})
}


var pruneMatrix = function(transMatrix) {
	console.log('pruneMatrix')
	var pruned = []
	for (var i=0; i < transMatrix.length; i++) {
		var rowSum = transMatrix[i].reduce(function(l, r) {
			return l+r
		})	
		if(rowSum === 0) {
			pruned.push(i)
		}
	}

	if(pruned.length > 0) {
		pruned.reverse()
		pruned.forEach(function(index) {
			pruneRow(index, transMatrix)
			pruneColumn(index, transMatrix)
		})
		pruned = pruned.concat(pruneMatrix(transMatrix))
	}

	return pruned;
}

var pruneRow = function(index, transMatrix) {
	transMatrix.splice(index, 1)
}

var pruneColumn = function(index, transMatrix) {
	for(var i=0; i<transMatrix.length; i++) {
		transMatrix[i].splice(index, 1)
	}
}



		// function(next) {
		// 	db.removeNoTransClusters(transMatrix, next)
		// },
		// function(transMatrix, next) {
		// 	db.insertTransMatrix(transMatrix, next)
			
		// }