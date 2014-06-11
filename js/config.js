
exports.TXN_VECTOR_BATCH_SIZE 		= 4000
exports.TXN_ID_BATCH_SIZE 			= 900
exports.MIN_SEQUENCE_SIZE 			= 2
exports.MAX_SEQUENCE_SIZE 			= 8
exports.NUM_RECOMMENDATIONS 		= 10
exports.TRAINING_SET_SIZE 			= 0.8
exports.VALIDATION_SET_SIZE 		= 1 - exports.TRAINING_SET_SIZE
//exports.MAX_TIME_DISTANCE 			= 900

exports.MIN_SEQUENCE_FREQUENCY 		= 8
exports.NUM_CENTROIDS				= 4

//easy sequence size refers to sequences with sizes that are easy/fast to compare to other sequences
exports.EASY_SEQUENCE_SIZE = 275 
//number of recommendations which are requested
exports.N = 5



var init = exports.init = function(datasetSize) {
	
	//the following values depend on the size of the dataset and
	//should probably be adjusted dynamically
	exports.MIN_SEQUENCE_FREQUENCY = Math.max(
		2, 
		Math.min(
			parseInt(Math.ceil(datasetSize / 11000), 10), 
			8
		)
	); 
	exports.NUM_CENTROIDS			 	= Math.max(2, parseInt(Math.ceil(datasetSize / 2000), 10))
	
	exports.DATASET_SIZE 				= datasetSize
	
	console.log(exports)
}

// init(7100)
// init(23000)
// init(100000)
// init(500000)

	

