

var levenshtein = function(s, t) {
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






var lev = function(s1, s2) {

	if(s1.length == 0) { 
		return s2.length 
	}
	
	if(s2.length == 0) { 
		return s1.length 
	}
	
	return Math.min(
		lev(s1.slice(0, s1.length-1), s2) + 1,
		lev(s1, s2.slice(0, s2.length-1)) + 1,
		lev(
			s1.slice(0, s1.length-1), 
			s2.slice(0, s2.length-1)) + 
		indicator(s1[s1.length-1], s2[s2.length-1])	
	);
}
		


var levenshteinNormalized = function(s1, s2) {
	return levenshtein(s1, s2) / Math.max(s1.length, s2.length)
}


var indicator = function(item1, item2) {
	return item1 === item2 ? 0 : 1;
}

// var d = distance([1,2,4], [1,3,3])
// console.log('distance', d)


exports.distance = levenshtein
exports.distanceNorm = levenshteinNormalized
exports.test = function() {
    var seqs = require('../sequences/seq-find').findSeqsNoMin([0,0,5,1,7,8])
    seqs.forEach(function(s1) {
        var s2  = [1,2,3,4]
        var d   = levenshteinNormalized(s1, s2)
        //console.log(s1, s2, d)
    })
}