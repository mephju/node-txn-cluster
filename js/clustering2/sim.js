var help = require('../help')
var simStore = require('./sim-store')

var calc = function(txn, frequentSeq) {
	return (1 - levenshtein(txn, frequentSeq))
	// var simLevenshtein 	= 1 - levenshtein(txn, frequentSeq)
	// var simSetSim 		= jaccard(txn, frequentSeq)
	// return (simLevenshtein * 2 + simSetSim) / 3 
}

exports.calcSim = simStore.calcSim
exports.calc = calc 







var jaccard = function(array1, array2) {
   var intersectNum = help.intersect(array1, array2).length
   if(intersectNum == 0) return 0
   return intersectNum/help.unionNum(array1, array2, intersectNum)
}







var levenshteinDistance = function(s, t) {
    // degenerate cases
    //if (s == t) return 0;
    if (s.length == 0) return t.length;
    if (t.length == 0) return s.length;
 
    // create two work vectors of integer distances
    var v0 = new Array(t.length + 1);
    var v1 = new Array(t.length + 1);
 
    // initialize v0 (the previous row of distances)
    // this row is A[0][i]: edit distance for an empty s
    // the distance is just the number of characters to delete from t
    for (var i = 0; i < v0.length; i++)
        v0[i] = i;
 
    for (var i = 0; i < s.length; i++) {
        // calculate v1 (current row distances) from the previous row v0
 
        // first element of v1 is A[i+1][0]
        //   edit distance is delete (i+1) chars from s to match empty t
        v1[0] = i + 1;
 
        // use formula to fill in the rest of the row
        for (var j = 0; j < t.length; j++) {
            var cost = (s[i] == t[j]) ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
 
        // copy v1 (current row) to v0 (previous row) for next iteration
        for (var j = 0; j < v0.length; j++)
            v0[j] = v1[j];
    }
 
    return v1[t.length];
}



		


var levenshtein = function(s1, s2) {
	return levenshteinDistance(s1, s2) / Math.max(s1.length, s2.length)
}



// var d = distance([1,2,4], [1,3,3])
// console.log('distance', d)







//var sim = exports.sim = function(vectorValues, centroid) {
// 	return dot(centroid, vectorValues) / len(centroid, vectorValues)
// }

// var dot = function(centroid, vectorValues) {
// 	var val = 0
// 	vectorValues.forEach(function(idxValPair) {
// 		//console.log('idxValPair', idxValPair)
// 		for(var idx in idxValPair) {
// 			val += centroid[idx] * idxValPair[idx]
// 		}
// 	})
// 	//console.log('dot', val)
// 	return val
// }

// var len = function(centroid, vectorValues) {
// 	var centroidLen = 0;
// 	var vectorLen = 0
	
// 	centroid.forEach(function(element) {
// 		centroidLen += element*element
// 	})

// 	vectorValues.forEach(function(idxValPair) {
// 		for(var idx in idxValPair) {
// 			vectorLen += idxValPair[idx]*idxValPair[idx]
// 		}
// 	})

// 	return Math.sqrt(centroidLen) * Math.sqrt(vectorLen)
// }