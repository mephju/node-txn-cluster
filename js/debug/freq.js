var db = require('../sequences/seq-store')

db.getFreqSeqs(function(err, frequents) {
	console.log(frequents)
})