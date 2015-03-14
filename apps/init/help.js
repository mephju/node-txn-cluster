
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
	 return fastIntersetcNum(array1, array2)
	 return array_intersect(array1, array2).length
	 var a = array1.slice(0)
	 var b = array2.slice(0)
	 
	 return intersectNumDes(a, b)
}

function fastIntersetcNum() {
	var ret = 0
	var i, all, shortest, nShortest, n, len, obj={}, nOthers;
	nOthers = arguments.length-1;
	nShortest = arguments[0].length;
	shortest = 0;
	for (i=0; i<=nOthers; i++){
	n = arguments[i].length;
	if (n<nShortest) {
	  shortest = i;
	  nShortest = n;
	}
	}

	for (i=0; i<=nOthers; i++) {
		n = (i===shortest)?0:(i||shortest); //Read the shortest array first. Read the first array instead of the shortest
		len = arguments[n].length;
		for (var j=0; j<len; j++) {
		    var elem = arguments[n][j];
		    if(obj[elem] === i-1) {
		      if(i === nOthers) {
		        ret++
		        obj[elem]=0;
		      } else {
		        obj[elem]=i;
		      }
		    }else if (i===0) {
		      obj[elem]=0;
		    }
		}
	}
	return ret;
	}

function array_intersect() {
  var i, all, shortest, nShortest, n, len, ret = [], obj={}, nOthers;
  nOthers = arguments.length-1;
  nShortest = arguments[0].length;
  shortest = 0;
  for (i=0; i<=nOthers; i++){
    n = arguments[i].length;
    if (n<nShortest) {
      shortest = i;
      nShortest = n;
    }
  }
 
  for (i=0; i<=nOthers; i++) {
    n = (i===shortest)?0:(i||shortest); //Read the shortest array first. Read the first array instead of the shortest
    len = arguments[n].length;
    for (var j=0; j<len; j++) {
        var elem = arguments[n][j];
        if(obj[elem] === i-1) {
          if(i === nOthers) {
            ret.push(elem);
            obj[elem]=0;
          } else {
            obj[elem]=i;
          }
        }else if (i===0) {
          obj[elem]=0;
        }
    }
  }
  return ret;
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


var arrayInArray = function(host, guest) {

	 var len = guest.length
	 
	 if(len > host.length) { return false }
	 
	 var max = guest[len-1]
	 
	 for(var i=0; i<len; i++){
			var item = guest[i]
			if(!valueInArray(host, item, max)) {
				 return false
			}
	 }

	 return true
}


var valueInArray= function(host, val, max) {
	 for(var i=0, len=host.length; i<len; i++) {
			var item = host[i]
			if(item === val) {
				 return true
			}
			if(item > max) {
				 return false
			}
	 }
	 return false
}



var intoSortedArray = function(host, value) {
	 host.splice(locationOf(value, host) + 1, 0, value);
	 return host
}

var locationOf = function(element, array, start, end) {
	start 	= start || 0;
	end 	= end || array.length;
	
	var pivot = parseInt(start + (end - start) / 2, 10);
	
	if (array[pivot] === element) {
		return pivot;
	}	
	if (end - start <= 1) {
		return array[pivot] > element ? pivot - 1 : pivot;
	}
	if (array[pivot] < element) {
		return locationOf(element, array, pivot, end);
	} 
	else {
		return locationOf(element, array, start, pivot);
	}
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

var getTrainingSetSize = function(db, done) {
	async.waterfall([
		function(next) {
			db.get('SELECT count(*) as count FROM txns', next)
		},
		function(row, next) {
			console.log(row)
			next(null, row.count)
		},
		function(size, next) {
			var trainingSetSize = Math.floor(size*config.TRAINING_SET_SIZE)
			log('getTrainingSetSize', size, '*', config.TRAINING_SET_SIZE, trainingSetSize)
			done(null, trainingSetSize)
		}
	], done)
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
exports.arrayInArray       = arrayInArray
exports.valueInArray       = valueInArray
exports.intoSortedArray    = intoSortedArray
exports.getTrainingSetSize = getTrainingSetSize