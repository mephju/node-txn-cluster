
var arrayEqual = function(arr1, arr2) {
	
	var len = arr1.length
	if(len != arr2.length) { return false }
	
	arr1.sort(cmp)
	arr2.sort(cmp)
	
	for(var i = 0; i<len; i++) {
		if(arr1[i] !== arr2[i]) { return false }
	}
	return true
}

var cmp = function(a,b) { 
	return a<b ? -1 : a>b ? 1 : 0 
}


exports.arrayEqual 	= arrayEqual
exports.numCmp 		= cmp