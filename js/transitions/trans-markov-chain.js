var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var rootDb 		= require('../db')
var config 		= require('../config')
var eachtick 	= require('eachtick')
var fs			= require('fs')
var transMarkovInfo = require('./trans-markov-info')

var N_GRAM_SIZE = config.MARKOV_ORDER + 1




var getMcInfo = function(done) {
	transMarkovInfo.getInfo(done)
}


var getMarkovChain = function(done) {
	async.waterfall([
		function(next) {
			var name = dataset.dataDir() + dataset.dbTable + '.markov-chain.json'
			fs.readFile(name, 'utf8', next)
		},
		function(markovChain, next) {
			markovChain = JSON.parse(markovChain)
			console.log('done reading markov chain')
			done(null, markovChain)
		}
	], done)
}


var buildMarkovChain = function(done) {
	console.log('buildMarkovChain')
	async.waterfall([
		function(next) {
			//var clusterNum = clusters.clusters.length
			// var transMatrix = initTransMatrix(clusterNum)
			db.getTransitions(next)
		},
		function(transitions, next) {
			console.log(transitions.length)
			onTransitions(transitions, next)
		},
		function(nGramCounts, next) {
			var name = dataset.dataDir() + dataset.dbTable + '.markov-chain.json'
			fs.writeFile(name, JSON.stringify(nGramCounts), next)
		}

	], done)
}


var onTransitions = function(transitions, done) {
	//console.log(transitions)
	var nGramCounts = {}
	transitions.forEach(function(tsnSeq, idx) {
		var nGrams = makeNGrams(tsnSeq)
		nGrams.forEach(function(nGram) {
			countNGram(nGram, nGramCounts)
		})

	})
	done(null, nGramCounts)	
}


var makeNGrams = function(tsnSeq) {
	//console.log('makeNGrams', tsnSeq.length, N_GRAM_SIZE)
	var nGrams = []
	for(var i=0; i+N_GRAM_SIZE <= tsnSeq.length; i++) {
		
		nGrams.push(tsnSeq.slice(i, i+N_GRAM_SIZE))
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




exports.buildMarkovChain = buildMarkovChain
exports.getMarkovChain = getMarkovChain











exports.test = {
	buildMarkovChain: buildMarkovChain,
	onTransitions: onTransitions,
	makeNGrams: makeNGrams,
	countNGram: countNGram,
	/**
	 * Needed for testing to make sure that ngram size is always the same for testing
	 * @param {[type]} size [description]
	 */
	setNGramSize: function(size) {
		N_GRAM_SIZE = size
	}

}