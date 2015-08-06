


function Config(options) {

	this.CROSS_VALIDATION_RUN 		= options.crossValidationRun ? options.crossValidationRun : 0
	this.MIN_SUPPORT				= 40// lastfm: 60, movielens: 250, 
	this.TRAINING_SET_SIZE 			= 0.6666667
	//this.TRAINING_SET_SIZE 			= 0.8
	this.VALIDATION_SET_SIZE 		= 1 - this.TRAINING_SET_SIZE
	this.TXN_ID_BATCH_SIZE 			= 900
	this.MIN_CLUSTER_SIZE 			= 4 // a cluster must at least have 4 members in order to survice clean up.
	this.CLUSTERS 					= options.txnCount ? parseInt(options.txnCount / 140) : 500
	//this.AVG_TXNS_PER_CLUSTER 		= 60
	this.MIN_CENTROID_LENGTH		= 20

	this.EASY_SEQUENCE_SIZE = 225 //225 
	//number of recommendations which are requested
	this.N = 5
	this.MAX_CONTRIBUTION = 0.6
	this.BASELINE_ON = true
	this.MARKOV_ORDER = options.markovOrder ? options.markovOrder : 2

	this.ITEM_CHOICE_STRATEGY = options.itemChoiceStrategy ? options.itemChoiceStrategy : 'bestItemsOfCluster'
	//this.DISTANCE_MEASURE = 'jaccard-levenshtein'
	this.DISTANCE_MEASURE = options.distanceMeasure ? options.distanceMeasure : 'levenshtein'
	// this.ITEM_CHOICE_STRATEGY = 'tfTfidf'
	// this.ITEM_CHOICE_STRATEGY = 'tfidf'
	// this.ITEM_CHOICE_STRATEGY = 'bestItemsOverall'
	// this.ITEM_CHOICE_STRATEGY = 'withRatings'



	this.RECOMMENDER = 'SessionBased'
	if(options.baseline) {
		this.RECOMMENDER = options.baseline
	}
	 //AprioriBased, SessionBased, PopularityBased
		
}


module.exports = Config


	