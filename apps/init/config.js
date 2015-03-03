

function Config() {
	this.MIN_SUPPORT					= 50
	this.TRAINING_SET_SIZE 			= 0.8
	this.VALIDATION_SET_SIZE 		= 1 - this.TRAINING_SET_SIZE
	this.TXN_ID_BATCH_SIZE 			= 900
	this.MIN_CLUSTER_SIZE 			= 4

	//easy sequence size refers to sequences with sizes that are 
	//easy/fast to compare to other sequences
	this.EASY_SEQUENCE_SIZE = 275 
	//number of recommendations which are requested
	this.N = 5
	this.MAX_CONTRIBUTION = 0.6
	this.BASELINE_ON = true
	this.MARKOV_ORDER = 2

	this.ITEM_CHOICE_STRATEGY = 'bestItemsOfCluster'
	this.DISTANCE_MEASURE = 'jaccard-levenshtein'
	// this.ITEM_CHOICE_STRATEGY = 'tfTfidf'
	// this.ITEM_CHOICE_STRATEGY = 'tfidf'
	// this.ITEM_CHOICE_STRATEGY = 'bestItemsOverall'
	// this.ITEM_CHOICE_STRATEGY = 'withRatings'

	const REC_REAL = 1
	const REC_APRIORI = 0

	this.RECOMMENDER = 'own-method'
	//this.RECOMMENDER = 'apriori-baseline'
	//this.RECOMMENDER = 'most-popular-baseline'

	this.reconfigure = function(trainingsetSize) {
		this.NUM_CENTROIDS = Math.max(2, parseInt(
			Math.ceil(trainingsetSize / 750)
		));
		this.NUM_CENTROIDS_POST_CLEAN_UP = this.NUM_CENTROIDS
		if(trainingsetSize < 400) {
			this.MIN_CLUSTER_SIZE = 2
		}
	}



	//this.TXN_VECTOR_BATCH_SIZE 		= 4000
	// this.MIN_SEQUENCE_FREQUENCY 		= 8
	//this.MIN_SEQUENCE_SIZE 			= 2
	//this.MAX_SEQUENCE_SIZE 			= 8
	//this.NUM_RECOMMENDATIONS 			= 10
	//this.MAX_TIME_DISTANCE 			= 900
}


module.exports = Config


	