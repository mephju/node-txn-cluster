var Parallel = require('paralleljs')


exports.countItemsets = function(counts, txns, candidates, useCores, done) {
	
	var len 		= candidates.length
	var sliceLen 	= Math.ceil(len / useCores)

	for(var i=0, j=0; i<useCores; i++) {
		new Parallel({
			txns: txns,
			candidates: candidates.slice(i*sliceLen, i*sliceLen + sliceLen),
		})
		.require(arrayInArray, valueInArray)
		.spawn(countItemsetsOfSlice)
		.then(function(countsOfSlice) {
			for(var key in countsOfSlice) {
				counts[key] = countsOfSlice[key]
			}
			if(++j === i){
				done(null, counts)
			}
		})
	}
}




var countItemsetsOfSlice = function(data) {
	console.log('countItemsetsOfSlice')
	var candidates = data.candidates
	var txns = data.txns
	var counts = {}

	for(var c=0,clen=candidates.length; c<clen; c++) {
		console.log(c, 'of', clen)
		var candidate = candidates[c]
		var key = candidate.toString()
		
		if(!counts[key]) { counts[key] = 0 }
		
		for(var t=0; t<txns.length; t++) {
			if(arrayInArray(txns[t], candidate)) {
				counts[key]++
			}
		}
	}

	return counts
}


function arrayInArray(host, guest) {

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

function valueInArray(host, val, max) {
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