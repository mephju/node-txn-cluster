var config = require('./config')
var deepEqual = require('deep-equal')
var _ = require('lodash')




var toItemset = function(array) {
   array.sort(cmp)
   return _.uniq(array)
}

var removeNulls = function(array) {
   var i =0
   while(i < array.length) {
      if(array[i] === null || typeof array[i] === 'undefined') {
         array.splice(i, 1)
         console.log('remove at idx', i)
      } else {
         i++
      }
   }
   return array;
}

var arrayRandomItems = function(n, array) {
   var items = []
   for(var i=0; i<array.length; i++) {
      var index = Math.floor(Math.random() * array.length)
      items.push(array[index])
   }
   return items
}


var clearArray = function(arr) {
   var len = arr.length
   for(var i=0; i<len; i++) {
      arr.pop()
   }
}

var textToNumArray = function(text) {
   return text.split(',').map(function(textNum) {
      return parseInt(textNum)
   })
}
var arrayContains = function(array, target) {
   for(var i=0, len=array.length; i<len; i++) {
      if(_.isEqual(array[i], target)) {
         return true;
      }
   }
   return false
}

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

var arraySum = function(array) {
   return array.reduce(function(l, r) {
      return r+l
   })
}

var toSet = function(array) {
   array.sort(cmp)
   
}

var cmp = function(a,b) { 
   return a-b
	//return a<b ? -1 : a>b ? 1 : 0 
}
var objCmp = function(a,b) { 
   return a.sum-b.sum; // ? -1 : a.sum<b.sum ? 1 : 0 
}






// Split txnIds into batches of txnIds to make batch processing on them
var toBatches = function(array, maxSize) {

   var maxBatchSize = maxSize || config.TXN_ID_BATCH_SIZE

   //console.log('make to batches for %d', array.length)

   var batches = []
   var batch = []
   
   array.forEach(function(elem, i, arr) {
      batch.push(elem)
      
      if(batch.length === maxBatchSize || i === array.length-1) {
         batches.push(batch)
         batch = []
      }
   })
   //console.log('created %d batches', batches.length)
   return batches
}





/**
 * [intersectNumDes calculates the intersection of a and b. 
 * a and b are modified afterwards]
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
var intersectNumDes = function(a, b) {
   var result = 0;
   
   a.sort(cmp);
   b.sort(cmp);
   
   var aLast = a.length - 1;
   var bLast = b.length - 1;
   
   while (aLast >= 0 && bLast >= 0) {
      if (a[aLast] > b[bLast] ) {
         aLast--;
      } else if (a[aLast] < b[bLast] ){
         bLast--;
      } else /* they're equal */ {
         result++;
         aLast--;
         bLast--;
      }
   }
   return result;
}




var intersectNum = function(array1, array2) {
   
   var a = array1.slice(0)
   var b = array2.slice(0)
   
   return intersectNumDes(a, b)
}



// var a = [1,2,3,4,5,11]
// var b = [1,2,10,11,12]

// console.log('intersect', intersectNum(a, b))




var intersect = function(array1, array2) {
   
   return _.intersection(array1, array2)

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



/**
 * Returns a list of indices of highest values sorted descending 
 * by the value each index is associated with.
 * @param  {[type]} numArray [description]
 * @param  {[type]} n        [description]
 * @return {[type]}          [description]
 */
var nMaxIndices = function(numArray, n) {
   var max     = []
   var indices = []

   for(var m=0; m<n; m++) {
      
      var candidate = {
         val: -1,
         idx: -1
      }

      numArray.forEach(function(val, i) {
         if(val > candidate.val && indices.indexOf(i) === -1) {
            candidate.val = val
            candidate.idx = i      
         }
      })

      if(candidate.idx !== -1) {
         max.push(candidate.val)
         indices.push(candidate.idx)   
      }
   }

   return indices
}

var maxIdx = function(numArray) {
   
   var max = numArray[0]
   var idx = 0
   
   for (var i=1, len=numArray.length; i<len; i++) {
      if(numArray[i] > max) {
         max = numArray[i]
         idx = i
      }
   }
   return idx
}


var minIdx = function(numArray) {
   var min = numArray[0]
   var idx = 0
   
   for (var i=0, len=numArray.length; i<len; i++) {
      if(numArray[i] < min) {
         min = numArray[i]
         idx = i
      }
   }
   return idx  
}


var avgFromArray = function(array) {
   return array.reduce(function(left, right) {
      return left+right
    }) / array.length
}


var contains = function(host, guest) {

   for(var i=0,len=host.length; i<len; i++) {
      var item = host[i]
      if(item[0] === guest[0] && item[1] === guest[1]) {
         return true
      }
   }
   return false
}



Array.prototype.hasArray = function(array) {
   if(!this.hash) {
      this.hash = {}
      for(var i=0; i<this.length; i++) {
         //console.log('hash', i)
         this.hash[this[i]] = i
      }
      //console.log('hash', this.hash, this.length)
   }

   return this.hash.hasOwnProperty(array)
}

Array.prototype.p = Array.prototype.push
Array.prototype.push = function(item) {
   this.p(item)
   if(this.hash) {
      this.hash[item] = this.length-1
   }
}



exports.toItemset          = toItemset
exports.contains           = contains
exports.deepEqual          = require('deep-equal').deepEqual
exports.removeNulls        = removeNulls
exports.arrayRandomItems   = arrayRandomItems
exports.nMaxIndices        = nMaxIndices
exports.clearArray         = clearArray
exports.avgFromArray       = avgFromArray
exports.textToNumArray     = textToNumArray
exports.maxIdx             = maxIdx
exports.minIdx             = minIdx
exports.unionNum           = unionNum
exports.arrayEqual         = arrayEqual
exports.arraySum           = arraySum
exports.numCmp             = cmp
exports.objCmp             = objCmp
exports.intersect          = intersect
exports.intersectNum       = intersectNum
exports.intersectNumDes    = intersectNumDes
exports.toBatches          = toBatches
exports.arrayContains      = arrayContains