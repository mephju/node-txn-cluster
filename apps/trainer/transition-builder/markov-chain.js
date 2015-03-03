
var fs			= require('fs')



function MarkovChain(dataset, transModel) {
	this.dataset = dataset
	this.transModel = transModel
	this.filepath = dataset.basePath + 'results/' + dataset.name + '-markov-chain.json'
	this.N_GRAM_SIZE = dataset.config.MARKOV_ORDER + 1
}

exports.MarkovChain = MarkovChain

MarkovChain.prototype.getMarkovChain = function(done) {
	var mc = this
	async.waterfall([
		function(next) {
			fs.readFile(mc.dataset.filepath, 'utf8', next)
		},
		function(markovChain, next) {
			markovChain = JSON.parse(markovChain)
			console.log('done reading markov chain')
			done(null, markovChain)
		}
	], done)
}


MarkovChain.prototype.build = function(done) {
	var mc = this
	console.log('transMarkovChain.buildMarkovChain')
	async.waterfall([
		function(next) {
			mc.transModel.getTransitions(next)
		},
		function(transitions, next) {
			log.green(transitions.length)
			onTransitions(transitions, next)
		},
		function(nGramCounts, next) {
			fs.writeFile(mc.filepath, JSON.stringify(nGramCounts), next)
		},
		function(next) {
			done()
		}

	], done)
}


MarkovChain.prototype.onTransitions = function(transitions, done) {
	//console.log(transitions)
	var chain = this
	var nGramCounts = {}
	transitions.forEach(function(tsnSeq, idx) {
		var nGrams = chain.makeNGrams(tsnSeq)
		nGrams.forEach(function(nGram) {
			countNGram(nGram, nGramCounts)
		})

	})
	done(null, nGramCounts)	
}


MarkovChain.prototype.makeNGrams = function(tsnSeq) {
	//console.log('makeNGrams', tsnSeq.length, N_GRAM_SIZE)
	var nGrams = []
	for(var i=0; i+this.N_GRAM_SIZE <= tsnSeq.length; i++) {
		
		nGrams.push(tsnSeq.slice(i, i+this.N_GRAM_SIZE))
	}
	return nGrams
}


var countNGram = function(nGram, nGramCounts) {

	var first 	= nGram[0]
	var obj 	= getOrCreateObj(nGramCounts, first)
	
	var i = 1
	for(; i<nGram.length-1; i++) {
		obj = getOrCreateObj(obj, nGram[i])
	}

	var num = getOrInitNum(obj, nGram[i])
	num++
	obj[nGram[i]] = num
}


var getOrInitNum = function(obj, key) {
	return obj[key] ? obj[key] : 0
}
var getOrCreateObj = function(obj, key) {
	if(!obj[key]) {
		obj[key] = {}
	} 
	return obj[key]
}












// exports.test = {
// 	buildMarkovChain: buildMarkovChain,
// 	onTransitions: onTransitions,
// 	makeNGrams: makeNGrams,
// 	countNGram: countNGram,
// 	*
// 	 * Needed for testing to make sure that ngram size is always the same for testing
// 	 * @param {[type]} size [description]
	 
// 	setNGramSize: function(size) {
// 		N_GRAM_SIZE = size
// 	}

// }


// var getMcInfo = function(done) {
// 	require('./trans-markov-info').getInfo(done)
// }