


/**
 * comboCall([1,2], 'a', fn)
 * results in fn being called multiple times like this:
 * fn(1, 'a')
 * fn(2, 'a')
 *
 * All combinations of the array params are produced and 
 * subsequently applied to the provided fn.
 * 
 * @return {[type]} [description]
 */
exports.comboCall = function() {

	var args 		= Array.prototype.slice.call(arguments)
	var last 		= args.length - 1
	var fn 			= args[last] 
	var paramArrays = args.splice(0, last)
	var numCalls 	= paramArrays.reduce(function(left, right) {
		return left * right.length
	}, 1)
	
	var calls = buildCalls(numCalls, paramArrays)
	
	return calls.map(function(callParams, i) {
		return fn.apply(this, callParams)
	}.bind(this))
}

var buildCalls = function(numCalls, paramArrays) {
	var changeNum = numCalls 
	var calls = []

	for(var i=0; i<numCalls; i++) {
		calls[i] = []
	}
	for(var i=0; i<paramArrays.length; i++) {
		var paramArray = paramArrays[i]

		changeNum /= paramArray.length 

		for(var call=0, p=-1; call<numCalls; call++) {
			
			if(call % changeNum === 0) {
				if(p === paramArray.length-1) {
					p = 0
				} else {
					p++
				}
			}
			calls[call][i] = paramArray[p] 
		}
	}

	return calls
}


