

exports.MIN_SUPPORT					= 50
exports.TRAINING_SET_SIZE 			= 0.8
exports.VALIDATION_SET_SIZE 		= 1 - exports.TRAINING_SET_SIZE
exports.TXN_ID_BATCH_SIZE 			= 900
exports.MIN_CLUSTER_SIZE 			= 4

//easy sequence size refers to sequences with sizes that are 
//easy/fast to compare to other sequences
exports.EASY_SEQUENCE_SIZE = 275 
//number of recommendations which are requested
exports.N = 5
exports.MAX_CONTRIBUTION = 0.6
exports.BASELINE_ON = true
exports.MARKOV_ORDER = 2

exports.ITEM_CHOICE_STRATEGY = 'bestItemsOfCluster'
// exports.ITEM_CHOICE_STRATEGY = 'tfTfidf'
// exports.ITEM_CHOICE_STRATEGY = 'tfidf'
// exports.ITEM_CHOICE_STRATEGY = 'bestItemsOverall'
// exports.ITEM_CHOICE_STRATEGY = 'withRatings'

const REC_REAL = 1
const REC_APRIORI = 0

exports.RECOMMENDER = 'own-method'
//exports.RECOMMENDER = 'apriori-baseline'
//exports.RECOMMENDER = 'most-popular-baseline'

exports.reconfigure = function(trainingsetSize) {
	exports.NUM_CENTROIDS = Math.max(2, parseInt(
		Math.ceil(trainingsetSize / 200)
	));
	exports.NUM_CENTROIDS_POST_CLEAN_UP = exports.NUM_CENTROIDS
	if(trainingsetSize < 400) {
		exports.MIN_CLUSTER_SIZE = 2
	}
}



//exports.TXN_VECTOR_BATCH_SIZE 		= 4000
// exports.MIN_SEQUENCE_FREQUENCY 		= 8
//exports.MIN_SEQUENCE_SIZE 			= 2
//exports.MAX_SEQUENCE_SIZE 			= 8
//exports.NUM_RECOMMENDATIONS 			= 10
//exports.MAX_TIME_DISTANCE 			= 900