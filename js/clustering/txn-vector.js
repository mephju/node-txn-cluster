var async 			= require('async')
var txnVectorDb		= require('./txn-vector-db')
var levenshtein  	= require('./sim-levenshtein')
var setOps			= require('./sim-set-sim')
var config			= require('../config')
var sequenceDb 		= require('../sequences/seq-store')
var seqFind			= require('../sequences/seq-find')
var txnDb 			= require('../transactions/db')
var txnApp 			= require('../transactions/app')
var dataset 		= require('../dataset-defs').dataset()


var freqSeqs = exports.freqSeqs = null


var buildVectors = function(callback) {
	console.log('buildVectors')
	async.waterfall([
		function(next) {
			txnVectorDb.dropTableTxnVector(dataset, next)
		},
		function(next) {
			txnVectorDb.createTableTxnVector(dataset, next)
		},
		function(next) {
			console.log('created txn vector table')
			sequenceDb.getFreqSeqs(next)
		},
		function(frequentSeqs, next) {

			freqSeqs = frequentSeqs.map(function(freqSeq) {
				return freqSeq.split(',').map(function(numstring) {
					return parseInt(numstring)
				})
			})

			txnApp.getTxnBatches(
				dataset,
				onTxnBatch,
				next
			);
		}
	], callback)
}



	

var batchCount = 1
var onTxnBatch = function(txnIdBatch, txnBatch, callback) {
	console.log('txnvector.onTxnBatch', batchCount++)
	
	var vectorBatch = buildVectorBatch(txnBatch, freqSeqs)
	//console.log('txnvector.vectorbatch', vectorBatch[0])	
	txnVectorDb.insertBatch(txnIdBatch, vectorBatch, callback)
}


/**
 * Build a vector for every txn in txnBatch.
 * A few optimisations take place:
 * 	
 * 	1. we only compute Levenshtein distance for sequences of same length
 */
var buildVectorBatch = function(txnBatch, freqSeqs) {
	return txnBatch.map(function(txn) {

		var vector = []
		var seqs = seqFind.findSeqs(txn,1)
		
		for(var i=0; i<freqSeqs.length; i++) {
			var filtered 	= filterToLength(txn, seqs, freqSeqs[i].length)
			var sim 		= similarity(filtered, freqSeqs[i]);
			

			if(sim > 0) {
				var elem = {}
				elem[i] = sim
				vector.push(elem)
			}
		}
		if(vector.length === 0) {
			console.log('no sim found')
		} else {
			console.log('sim found')
		}
		return vector
	})
}





var similarity = function(seqs, frequentSeq) {

	var max = 0;
	for(var i=0; i<seqs.length; i++) {
		
		var simLevenshtein 	= 1 - levenshtein.distanceNorm(seqs[i], frequentSeq)
		var simSetSim 		= setOps.setSim(seqs[i], frequentSeq)
		var sim 			= (simLevenshtein * 2 + simSetSim) / 3

		if(sim > max) {
			max = sim
			//optimization: if one seq is already close enough, just use that value
			if(max >= 0.5) {
				return max
			}
		}
	}

	return max
}


var triangularNum = function(n) {
	return (n*(n+1))/2
}

/**
 * Filter sequences so that only those with certain length n remain.
 * In case where n exceeds length of any sequence no filtering takes place.
 *
 * n will often be the length of a frequent sequence.
 *
 * The reason is that sequences of length n have the most chance to be similar
 * to another sequence of length n.
 */
var filterToLength = function(txn, seqs, n) {
	// if(txn.length > 3) {
	// 	return seqs.reverse()
	// }
	if(seqs.length >= txn.length) {
		filteredSeqs = seqs.filter(function(seq) {
			return seq.length == n
		})
		return filteredSeqs
	}
	return seqs
}

exports.buildVectors = buildVectors
exports.buildVectorBatch = buildVectorBatch
exports.filterToLength = filterToLength