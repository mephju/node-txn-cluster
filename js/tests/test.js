var async = require('async')



var t = [ 3186,
  1022,
  1270,
  1721,
  2340,
  1836,
  3408,
  1207,
  2804,
  260,
  720,
  1193,
  919,
  608,
  2692,
  1961,
  2028,
  3105,
  123,
  143123342,
  13232,
  124,
  455,
  1,
  2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 ]


var itemsets = []
var genItemsets = function(k, alphabet) {
    
    

    //test
    if(alphabet.length < k) {
        throw 'err: '
    }


    var ext = function(itemset) {

        if(itemset.length < k) {
            var startIdx = getNextIdx(itemset) 

            for(var i=startIdx; i+k-startIdx<=alphabet.length && i<alphabet.length; i++) {
                
                var newSet = itemset.slice(0)
                newSet.push(alphabet[i])
                ext(newSet.splice(0))
            }
        } else {
            itemsets.push(itemset)    
        }       
    }


    var getNextIdx = function(itemset) {
        var len = itemset.length
        if(len == 0) return 0
        else {
            return alphabet.indexOf(itemset[len-1]) + 1
        }
    }

    ext([])
    //console.log(itemsets)
}


var copyDel = function(array) {
    var a = array.slice(0)
    array = null
}

for(var i=1; i<=t.length; i++) {
    console.log(i)
    genItemsets(i, t)    
}

console.log(itemsets)

// async.series([
//     function(callback){        
//         callback({}, 'one');
//     },
//     function(callback){
//         callback(null, 'two');
//     }
// ], function(err, results){
//     if(err) {
//         console.log(err)    
//     }
//     console.log('done ', results)
// });


// async.each(
//     [], 
//     function(item, cb) {
//         console.log(item)
//         cb()
//     },
//     function(err) {
//         console.log('cb')
//         console.log(err)
//     }
// );