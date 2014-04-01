

// txnVector is a vector subsitute which looks like this:
// [	
// 	{"38824":0.06666666666666667},
// 	{"38828":1},
// 	{"38829":1},
// 	{"38833":0.5333333333333333}
// ]
// Each key is the idx of the vector
var sim = exports.sim = function(vectorValues, centroid) {
	return dot(centroid, vectorValues) / len(centroid, vectorValues)
}

var dot = function(centroid, vectorValues) {
	var val = 0
	vectorValues.forEach(function(idxValPair) {
		//console.log('idxValPair', idxValPair)
		for(var idx in idxValPair) {
			val += centroid[idx] * idxValPair[idx]
		}
	})
	//console.log('dot', val)
	return val
}

var len = function(centroid, vectorValues) {
	var centroidLen = 0;
	var vectorLen = 0
	
	centroid.forEach(function(element) {
		centroidLen += element*element
	})

	vectorValues.forEach(function(idxValPair) {
		for(var idx in idxValPair) {
			vectorLen += idxValPair[idx]*idxValPair[idx]
		}
	})

	return Math.sqrt(centroidLen) * Math.sqrt(vectorLen)
}
