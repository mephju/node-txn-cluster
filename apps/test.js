
var counts = {}
for(var i=0; i<1000000; i++) {
	counts['' + i] = i
}

var now = new Date().getTime()
for(var key in counts) {
	counts[key]++
} 
var duration = new Date().getTime() - now


var now = new Date().getTime()
var keys = Object.keys(counts)
var key = 0
for(var i=0, len=keys.length; i<len; i++) {
	key = keys[i] 
	counts[key]++
} 
var duration2 = new Date().getTime() - now

console.log(duration, duration2)