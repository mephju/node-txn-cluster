
var alreadyDone = [
//distance, markov, strategy, xvalidation

	['levenshtein', 1, 'bestItemsOfCluster', 0],
	['levenshtein', 1, 'bestItemsOfCluster', 1],
	['levenshtein', 1, 'bestItemsOfCluster', 2],
	['levenshtein', 1, 'random', 0], 
	['levenshtein', 1, 'random', 1], 
	['levenshtein', 1, 'random', 2],
	['levenshtein', 1, 'tfTfidf', 0], 
	['levenshtein', 1, 'tfTfidf', 1], 
	['levenshtein', 1, 'tfTfidf', 2], 
	['levenshtein', 1, 'tfidf', 0], 
	['levenshtein', 1, 'tfidf', 1], 
	['levenshtein', 1, 'tfidf', 2],
	['levenshtein', 2, 'bestItemsOfCluster', 0], 
	['levenshtein', 2, 'bestItemsOfCluster', 1], 
	['levenshtein', 2, 'bestItemsOfCluster', 2],
	['levenshtein', 2, 'tfidf', 0], 
	['levenshtein', 2, 'tfidf', 1], 
	['levenshtein', 2, 'tfidf', 2]

]


module.exports =  function(evaluationRuns) {
	return evaluationRuns.filter(function(d) {

		return alreadyDone.every(function(conf) {
			
			return !(d.config.DISTANCE_MEASURE === conf[0] 
			&& d.config.MARKOV_ORDER === conf[1] 
			&& d.config.ITEM_CHOICE_STRATEGY === conf[2]
			&& d.config.CROSS_VALIDATION_RUN === conf[3])
		})

	})
}