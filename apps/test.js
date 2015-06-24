var help = require('./init/help')
var jaccardBigram = function(array1, array2) {


    var len1    = array1.length
    var len2    = array2.length
    var len     = Math.max(len1, len2)

    if(Math.min(len1, len2) < 2) { return 0 }

    var array1Bigrams = []
    var array2Bigrams = []

    

    for(var i=1; i<len; i++) {

        if(i < len1) {
            var candidate = array1.slice(i-1, i+1) //[array1[i-1], array1[i]]
            if(!help.contains(array1Bigrams, candidate)) {
                array1Bigrams.push(candidate)    
            }
        }
        if(i < len2) {
            var candidate = array2.slice(i-1, i+1) //[array2[i-1], array2[i]]
            if(!help.contains(array2Bigrams, candidate)) {
                array2Bigrams.push(candidate)    
            }
        }
    }


    var intersectNum = help.intersectNum(
        array1Bigrams, 
        array2Bigrams
    );
    //log(array1Bigrams, array2Bigrams, intersectNum)
    return intersectNum/(array1Bigrams.length + array2Bigrams.length - intersectNum)
}



var jaccardBigramText = function(array1, array2) {

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



var arrays = [
	[1,2,3,4],
	[1,2,4,3],
	[1,4,1,7,6,343,3,23,234,6787,5,23,23,34,23,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,2,56,3,2,23,3,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,56,56767,,123,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,8,9,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,11,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,44,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,22,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,1,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[2,4,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,23,234,6787,5,23,23,34,23,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,2,56,3,2,23,3,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,56,56767,,123,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,8,9,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,11,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,44,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,22,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,1,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[2,4,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,23,234,6787,5,23,23,34,23,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,2,56,3,2,23,3,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,56,56767,,123,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,8,9,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,11,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,44,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,22,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,1,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[2,4,1,7,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,23,234,6787,5,23,23,34,23,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,6,343,3,2,56,3,2,23,3,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,7,56,56767,,123,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,8,9,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8],
	[1,4,1,4,6,343,3,23,234,6787,980,44,11,23,334,5345,1,33,6,7,8]
];


var start = new Date().getTime()

arrays.forEach(function(array1) {
	arrays.forEach(function(array2) {
		var d = jaccardBigram(array1, array2)
	})
})
var end = new Date().getTime()

console.log('jaccardBigram', end-start)
console.log('jaccardBigram')
console.log('jaccardBigram')

var start = new Date().getTime()

arrays.forEach(function(array1) {
	arrays.forEach(function(array2) {
		var d = jaccardBigramText(array1, array2)
	})
})
var end = new Date().getTime()
console.log('jaccardBigramText', end-start)