

var Parallel = require('paralleljs')
require('./init')

var counts = {
	a:7553, 
	b:53,
	c:3,
	d:77553,
	e:53,
	f:153,
	g:753,
	h:13,
	i:23,
	aa:7553,
	bb:53,
	cc:3,
	dd:77553,
	ee:53,
	ff:153,
	gg:753,
	hh:13,
	ii:23,
	aaaa:7553,
	bbbb:53,
	cccc:3,
	dddd:77553,
	eeee:53,
	ffff:153,
	gggg:753,
	hhhh:13,
	iiii:23,
	aaaa:7553,
	bbbb:53,
	cccc:3,
	dddd:77553,
	eeee:53,
	ffff:153,
	gggg:753,
	hhhh:13,
	iiii:23,

}


// var parallels = [
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11]),
// 	new Parallel([1,2,3,4,5,6,7,8,9,10,11])
// ];

// parallels.forEach(function(p, i) {
// 	p
// 	.spawn(function(vals) {
// 		vals.forEach(function(item, i) {
// 			console.log(item*item)
// 		}, 3)
// 		return ''
// 	})
// 	.then(function() {
// 		//console.log(arguments)
// 	})
// })








var prune = function(counts) {

	const MIN_SUPPORT = 100 //this.dataset.config.MIN_SUPPORT
	var useCores = 8 //this.dataset.config.USE_CORES
	var keys = Object.keys(counts)
	var slices = []
	var len = Math.ceil(keys.length / useCores)
	var toDelete = []


	
	for (var i = 0; i < useCores; i++) {
		slices.push(keys.slice(i*len, i*len+len))
	};

	
	async.eachSeries(
		slices,
		function(slice, next) {
			
			new Parallel({
				keys: slice,
				counts: counts,
				MIN_SUPPORT: MIN_SUPPORT
			})
			.spawn(function(data) {

				var counts = data.counts
				var keys = data.keys
				var MIN_SUPPORT = data.MIN_SUPPORT

				console.log('keys', keys)

				var toDelete = []

				for(var i=0, len=keys.length; i<len; i++) {
					var key = keys[i]
					var val = counts[key]
					
					if(val < MIN_SUPPORT) {
						toDelete.push(key)
					}
				}
				return toDelete
			})
			.then(function(res) {
				toDelete = toDelete.concat(res)
			})
			next()
			
		},
		function(err) {
			console.log(toDelete)
		}
	);

			

}




prune(counts)
	

	
