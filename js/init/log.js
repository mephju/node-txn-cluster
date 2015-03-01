/*
	LOG
 */


var log = function(){
	console.log.apply(this, arguments)
}
log.colored = function(color, args) {
	var array = [];
	for(var i=0; i<args.length; i++) {
		array.push(args[i])
	}
	array.unshift(color)
	array.push(colors.Reset)
	console.log.apply(this, array)
}
log.i = function() {
	log.colored(colors.FgGreen, arguments)
}
log.w = function() {
	log.colored(colors.FgYellow, arguments)
}
log.e = function() {
	log.colored(colors.FgRed, arguments)
}
log.json = function(data) {
	try {
		log(JSON.stringify(data, null, 2))	
		log.i('')
	} catch(e) {
		console.log(colors.FgCyan, 'not json data', colors.FgReset)
	}
}


log.green = function() {
	log.colored(colors.FgGreen, arguments)
}
log.yellow = function() {
	log.colored(colors.FgYellow, arguments)
}
log.red = function() {
	log.colored(colors.FgRed, arguments)
}
log.magenta = function() {
	log.colored(colors.FgMagenta, arguments)
}
log.cyan = function() {
	log.colored(colors.FgCyan, arguments)
}
log.brown = function() {
	log.colored(colors.FgBrown, arguments)
}
log.blue = function() {
	log.colored(colors.FgBlue, arguments)
}
log.white = function() {
	log.colored(colors.FgWhite, arguments)
}
log.hidden = function() {
	log.colored(colors.Hidden, arguments)
}
log.reverse = function() {
	log.colored(colors.Reverse, arguments)
}
log.blink = function() {
	log.colored(colors.Blink, arguments)
}
log.underscore = function() {
	log.colored(colors.Underscore, arguments)
}
log.dim = function() {
	log.colored(colors.Dim, arguments)
}
log.bright = function() {
	log.colored(colors.Bright, arguments)
}

exports = module.exports = log