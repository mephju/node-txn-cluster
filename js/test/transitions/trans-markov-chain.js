var transMarkovChain = require('../../transitions/trans-markov-chain').test
var assert = require('assert')



describe('transMarkovChain', function() {

	var transition = [-1,2,3,4,5]

	describe('makeNGrams', function() {
		
		it('produces 3 nGrams', function() {
			transMarkovChain.setNGramSize(3)
			var nGrams = transMarkovChain.makeNGrams(transition)
			assert.equal(3, nGrams.length)
		})


		it('produces 4 nGrams', function() {
			transMarkovChain.setNGramSize(2)
			var nGrams = transMarkovChain.makeNGrams(transition)
			assert.equal(4, nGrams.length)
		})
	})

	describe('countNGram', function() {
		
		var nGramCounts = {}

		it('counts [3,4,5] 2 times', function() {
			transMarkovChain.countNGram([3,4,5], nGramCounts)
			transMarkovChain.countNGram([3,4,5], nGramCounts)
			assert.equal(nGramCounts[3][4][5], 2)
		})

		it('counts [10,11,12,13] 2 times', function() {
			var nGram = [10, 11, 12, 13]
			transMarkovChain.countNGram(nGram, nGramCounts)
			transMarkovChain.countNGram(nGram, nGramCounts)
			assert.equal(nGramCounts[10][11][12][13], 2)
		})

	})


	
})