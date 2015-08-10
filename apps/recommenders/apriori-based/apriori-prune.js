var Parallel = require('paralleljs')


exports.prune = function(params, done) {

	log.blue('pruning')

	const MIN_SUPPORT 	= params.MIN_SUPPORT
	var useCores 		= params.USE_CORES
	var counts 			= params.counts
	var keys 			= Object.keys(counts)
	var len 			= Math.ceil(keys.length / useCores)
	var slices 			= []
	var toDelete 		= []
	var finishedCount 	= 0
	
	for (var i = 0; i < useCores; i++) {
		slices.push(keys.slice(i*len, i*len+len))
	}

	for (var i = 0; i < 10 && i < keys.length; i++) {
		log.blue(keys[i], counts[keys[i]])
	}	

	log.yellow('have to prune keys', keys.length, slices.length, useCores)
	
	slices.forEach(function(slice) {
		new Parallel({
			keys: slice,
			counts: counts,
			MIN_SUPPORT: MIN_SUPPORT
		})
		.spawn(findRareKeys)
		.then(function(res) {
			log.blue('prune slice finished')
			finishedCount++

			res.forEach(function(item, i) {
				toDelete.push(item)
			})

			if(finishedCount === slices.length) {
				toDelete.forEach(function(key, i) {
					delete counts[key]
				})
				done(null, counts)
			}
		})
	})
}


var findRareKeys = function(data) {

	console.log('spawn')

	var counts 		= data.counts
	var keys 		= data.keys
	var MIN_SUPPORT = data.MIN_SUPPORT
	var toDelete = []

	for(var i=0, len=keys.length; i<len; i++) {
		var key = keys[i]
		var val = counts[key]
		
		if(val < MIN_SUPPORT) {
			toDelete.push(key)
		}
	}
	return toDelete
}