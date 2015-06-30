var DistanceStore = require('./distance-store')

function Distance(dataset) {
    this.dataset = dataset
    this.config = dataset.config
    

    switch(this.config.DISTANCE_MEASURE) {
        case 'jaccard-levenshtein':
            this.distanceAlgo = jaccLevDistance
            break;
        case 'jaccard':
            this.distanceAlgo = jaccardDistance
            break;
        case 'jaccard-bigram':
            this.distanceAlgo = jaccardBigramDistance
            break;
        case 'levenshtein':
            this.distanceAlgo = levenshtein
            break;
        default: throw 'no distance measure defined'
    }

    this.distanceStore = new DistanceStore(dataset, this)
}

Distance.prototype.distance = function(left, right) {
    //log.yellow('distance', left, right)
    //return this.distanceAlgo(left, right)
    return this.distanceStore.distance(left, right)
}

exports.Distance = Distance

    


/**
 * Calculates distance of jaccard and levenshtein
 * @param  {[type]} array1 [description]
 * @param  {[type]} array2 [description]

      *       [description]
 */
var jaccLevDistance = function(array1, array2) {
    //log('jaccLevDistance', array1, array2)
    return 1/4 * jaccardDistanceSlow(array1, array2) + 3/4 * levenshtein(array1, array2)
}

var jaccLevSim = function(array1, array2) {
    return 
        1/4 * jaccard(array1, array2) + 
        3/4 * (1 - levenshtein(array1, array2))
}


var jaccardBigramDistance = function(array1, array2) {
    return 1-jaccardBigram(array1, array2)
}
var jaccardBigram = function(array1, array2) {

    var len1    = array1.length - 1
    var len2    = array2.length - 1
    var len     = Math.max(len1, len2)

    if(Math.min(len1, len2) < 1) { return 0 }

    var array1Bigrams = {}
    var array2Bigrams = {}

    for(var i=0; i<len; i++) {

        if(i < len1) {
            var candidate = array1[i] + ',' + array1[i+1] 
            array1Bigrams[candidate] = true
        }
        if(i < len2) {
            var candidate = array2[i]  + ',' + array2[i+1]
            array2Bigrams[candidate] = true
        }
    }


    array1Bigrams = Object.keys(array1Bigrams)
    array2Bigrams = Object.keys(array2Bigrams)



    var intersectNum = help.intersectNum(
        array1Bigrams, 
        array2Bigrams
    );
    // console.log(array1Bigrams, array2Bigrams, intersectNum)
    //log(array1Bigrams, array2Bigrams, intersectNum)
     return intersectNum/(array1Bigrams.length + array2Bigrams.length - intersectNum)
    // return intersectNum / Math.max(array1Bigrams.length, array2Bigrams.length)
}



var jaccardDistanceSlow = function(array1, array2) {
    var intersectNum = help.intersectNum(array1, array2)
    if(intersectNum === 0) return 1
    return 1 - intersectNum / (array1.length + array2.length - intersectNum)
}



var jaccardDistance = function(array1, array2) {
    var intersectNum = intersect(array1, array2)
    if(intersectNum === 0) return 1
    return 1 - intersectNum / (array1.length + array2.length - intersectNum)
}


/**
 * Assumes that a1 and a2 are sorted in ascending order.
 * @param  {[type]} a1 [description]
 * @param  {[type]} a2 [description]
 * @return {[type]}    [description]
 */
var intersect =  function(a1, a2) {
    var x = 0
    var len1 = a1.length
    var len2 = a2.length
    var max1 = a1[len1-1]
    var max2 = a2[len2-1]

    for(var i=0; i<len1; i++) {

        if(a1[i] > max2) { break }
        
        for(var j=0; j<len2; j++) {
            
            if(a1[i] < a2[j])   { break }
            if(a1[i] === a2[j]) { x++; break }
        }

    }

    return x
}

Distance.intersectSlow = help.intersectNum
Distance.intersect = intersect






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
 
    return v1[t.length] / Math.max(s.length, t.length);
}



		





//exports.levenshteinDistance = levenshteinDistance
//exports.calc = exports.calcSim
exports.test = {
    jaccardBigram: jaccardBigram,
    levenshtein:levenshtein,
    jaccardDistance: jaccardDistance,
    jaccLev: jaccLevDistance
}