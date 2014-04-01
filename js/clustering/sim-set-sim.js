

var cmp  = function(a,b) { 
   return a<b ? -1 : a>b ? 1 : 0 
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


var setSim = function(array1, array2) {
   var intersectNum = intersect(array1, array2).length
   if(intersectNum == 0) return 0
   return intersectNum/unionNum(array1, array2, intersectNum)
}

exports.intersect = intersect
exports.unionNum = unionNum
exports.setSim = setSim