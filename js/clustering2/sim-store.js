var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async			= require('async')
var sim				= require('./sim')
var config			= require('../config')

var simStore = {}





var calcSim = function(seq1, seq2) {
	var similarity;

	if(seq1.length > config.EASY_SEQUENCE_SIZE && seq2.length > config.EASY_SEQUENCE_SIZE) {
		console.log('slow op ahead')
		var key1 = seq1.toString()
		var key2 = seq2.toString()

		var substore1 = simStore[key1] 
		var substore2 = simStore[key2]
		
		if(typeof(substore1) === 'undefined') {
			console.log('create store1')
			substore1 = {}
			simStore[key1] = substore1
		}
		if(typeof(substore2) === 'undefined') {
			console.log('create store2')
			substore2 = {}
			simStore[key2] = substore2
		}

		similarity = substore1[key2]
		
		if(typeof(similarity) === 'undefined') {
			console.log('calculate similarity')
			similarity = sim.calc(seq1, seq2)
			substore1[key2] = similarity
			substore2[key1] = similarity
		}
	} else {
		similarity = sim.calc(seq1, seq2)
	}
	return similarity
}


exports.calcSim = calcSim