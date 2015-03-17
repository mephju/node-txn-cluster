
var async = require('async')

exports.forloop = function(times, fn, done) {
	var run = 0
	async.whilst(
		function() { return run < times },
		function(next) {
			fn(run, times, next)
			run++
		},
		done
	);
}


exports.wfall = function(waterfall, _this, done) {
	waterfall = waterfall.map(function(fn) {
		return fn.bind(_this)
	})

	async.waterfall(waterfall, done)
}



exports.eachChain = function() {

	
	var args = Array.prototype.slice.call(arguments)
	var len = args.length

	var array = args[0]
	var eachFun = args[1]
	var _this = typeof args[len-1] !== 'function' ? args[--len] : null
	var done = args[len-1]

	var waterfall = args.slice(2,len-1)
	
	if(_this) {
		log.green('found this')
		eachFun = eachFun.bind(_this)
		waterfall = waterfall.map(function(fn) {
			return fn.bind(_this)
		})
	}

	async.eachSeries(
		array,
		function(item, next) {
			eachFun(item, makeWaterfallWrapper(waterfall, next))
		},
		function(err) {
			done(err)
		}
	);
}


var makeWaterfallWrapper = function(waterfall, onWaterfallFinished) {
	

	return function() {

		var args = Array.prototype.slice.call(arguments);
		
		waterfall.unshift(function before(next) {
			next.apply(this, args)
		})

		waterfall.push(function after() {
			waterfall.shift()
			waterfall.pop()
			onWaterfallFinished()
		})	

		async.waterfall(waterfall, onWaterfallFinished)	
	}
}


// exports.eachChain(
// 	[1,2,3],
// 	function(item, next) {
// 		next(null, 'first', 'second')
// 	}, 
// 	function(result1, result2, next){
// 		console.log(1, result1, result2)
// 		next(null, 'first first', 'second second')
// 	},
// 	function(result1, result2, next) {
// 		console.log(2, result1, result2)
// 		next()
// 	},
// 	function(err) {
// 		console.log('finished', err)
// 	}
// );
