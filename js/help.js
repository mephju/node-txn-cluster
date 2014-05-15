var config = require('./config')


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







// Split txnIds into batches of txnIds to make batch processing on them
var toBatches = function(array, maxSize) {

   var maxBatchSize = maxSize || config.TXN_ID_BATCH_SIZE

   console.log('make to batches for %d', array.length)

   var batches = []
   var batch = []
   
   array.forEach(function(elem, i, arr) {
      batch.push(elem)
      
      if(batch.length === maxBatchSize || i === array.length-1) {
         batches.push(batch)
         batch = []
      }
   })
   console.log('created %d batches', batches.length)
   return batches
}








var intersect = function(array1, array2) {
   var result = [];
   
   var a = array1.slice(0).sort(cmp);
   var b = array2.slice(0).sort(cmp);
   
   var aLast = a.length - 1;
   var bLast = b.length - 1;
   
   while (aLast >= 0 && bLast >= 0) {
      if (a[aLast] > b[bLast] ) {
         a.pop();
         aLast--;
      } else if (a[aLast] < b[bLast] ){
         b.pop();
         bLast--;
      } else /* they're equal */ {
         result.push(a.pop());
         b.pop();
         aLast--;
         bLast--;
      }
   }
   return result;
}

var unionNum = function(array1, array2, intersectNum) {
   return array1.length + 
      array2.length - 
      intersectNum;
}


var maxIdx = function(numArray) {
   
   var max = numArray[0]
   var idx = 0
   
   for (var i=0, len=numArray.length; i<len; i++) {
      if(numArray[i] > max) {
         max = numArray[i]
         idx = i
      }
   }
   return idx
}



exports.maxIdx             = maxIdx
exports.unionNum           = unionNum
exports.arrayEqual         = arrayEqual
exports.numCmp             = cmp
exports.intersect          = intersect
exports.toBatches          = toBatches