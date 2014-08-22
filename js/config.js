

exports.MIN_CLUSTER_SIZE 			= 1
exports.NUM_CENTROIDS				= 4
exports.MIN_SUPPORT					= 100
exports.TRAINING_SET_SIZE 			= 0.8
exports.VALIDATION_SET_SIZE 		= 1 - exports.TRAINING_SET_SIZE
exports.TXN_ID_BATCH_SIZE 			= 900



//easy sequence size refers to sequences with sizes that are 
//easy/fast to compare to other sequences
exports.EASY_SEQUENCE_SIZE = 275 
//number of recommendations which are requested
exports.N = 5
exports.MAX_CONTRIBUTION = 0.6
exports.BASELINE_ON = true
exports.MARKOV_ORDER = 2
exports. ITEM_CHOICE_STRATEGY = {
	tfTfidf: false,
	tfidf:false,
	bestItemsOfCluster:true,
	bestItemsOverall: false,
	withRatings: false,
}

const REC_REAL = 1
const REC_APRIORI = 0
exports.RECOMMENDER = REC_APRIORI




var init = exports.init = function(datasetSize) {
	
	//the following values depend on the size of the dataset and
	//should probably be adjusted dynamically
	exports.NUM_CENTROIDS = Math.max(2, parseInt(Math.ceil(datasetSize / 2000), 10))
	exports.DATASET_SIZE = datasetSize
	
	console.log(exports)
}


//exports.TXN_VECTOR_BATCH_SIZE 		= 4000
// exports.MIN_SEQUENCE_FREQUENCY 		= 8
//exports.MIN_SEQUENCE_SIZE 			= 2
//exports.MAX_SEQUENCE_SIZE 			= 8
//exports.NUM_RECOMMENDATIONS 			= 10
//exports.MAX_TIME_DISTANCE 			= 900
