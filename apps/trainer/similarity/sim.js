
var simStore = require('./sim-store')


    
    //return 1 - jaccard(txn, frequentSeq)
    
    //console.log(sim)
    //return sim
	//return (1 - levenshtein(txn, frequentSeq))
	// var simLevenshtein 	= 1 - levenshtein(txn, frequentSeq)
	// var simSetSim 		= jaccard(txn, frequentSeq)
	// return (simLevenshtein * 2 + simSetSim) / 3 


//exports.calcSim = simStore.calcSim


/**
 * Calculates distance of jaccard and levenshtein
 * @param  {[type]} array1 [description]
 * @param  {[type]} array2 [description]
 * @return {[type]}        [description]
 */
var jaccLev = function(array1, array2) {
    return 1/4 * (1-jaccard(array1, array2)) + 3/4 * levenshtein(array1, array2)
}

var jaccLevSim = function(array1, array2) {
    return 
        1/4 * jaccard(array1, array2) + 
        3/4 * (1 - levenshtein(array1, array2))
}


var jaccardBigramDist = function(array1, array2) {
    return 1-jaccardBigram(array1, array2)
}


var jaccardBigram = function(array1, array2) {


    var len1    = array1.length
    var len2    = array2.length

    if(Math.min(len1, len2) < 2) { return 0 }

    var len     = Math.max(len1, len2)

    var array1Bigrams = []
    var array2Bigrams = []

    var candidate = new Array(2)

    for(var i=1; i<len; i++) {
        if(i < len1) {
            candidate[0] = array1[i-1]
            candidate[1] = array1[i]
            if(!help.contains(array1Bigrams, candidate)) {
                array1Bigrams.push(candidate.slice(0))    
            }
            
        }
        if(i < len2) {
            candidate[0] = array2[i-1]
            candidate[1] = array2[i]
            if(!help.contains(array2Bigrams, candidate)) {
                array2Bigrams.push(candidate.slice(0))    
            }
        }
    }


    var intersectNum = help.intersectNumDes(
        array1Bigrams, 
        array2Bigrams
    );

    return intersectNum/(array1Bigrams.length + array2Bigrams.length - intersectNum)


}




var jaccard = function(array1, array2) {
   var intersectNum = help.intersectNum(array1, array2)
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

exports.calcSim = jaccLev
exports.levenshteinDistance = levenshteinDistance
exports.calc = exports.calcSim
exports.test = {
    jaccardBigram: jaccardBigram,
    levenshtein:levenshtein,
    jaccard: jaccard,
    jaccLev: jaccLev
}