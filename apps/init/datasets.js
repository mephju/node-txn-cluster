var fs 		= require('fs')
var async 	= require('async')


//var baseDatasetPath = '/home/kokirchn/thesis/'

function Dataset(filepath, name, _config) {
	log('BASE_PATH', process.env.BASE_PATH)

	this.config = _config
	var basePath = process.env.BASE_PATH ? process.env.BASE_PATH : '/stuff/datamining/'
	this.basePath = basePath
	this.name = name
	this.resultPath = basePath + 'results/'
	this.filepath 	= basePath + 'datasets/' + filepath 
	this.dbPath 	= this.resultPath + name + '.sqlite'
	this.datasetSize = 0
	this.trainingSize = 0
	this.separator = null
	this.timeDistance = 0
	this.indices = null
}


Dataset.prototype.resultDbPath = function() {
	return this.basePath + 'results/evaluation-results.sqlite'
}


Dataset.prototype.prefixTableNameFull = function(tableName) {
	log.red('prefixTableNameFull', tableName)

	return this.config.DISTANCE_MEASURE.replace(/-/g, '_') + '_x_validation_run_' + 
		this.config.CROSS_VALIDATION_RUN + '_markov_order_' + 
		tableName
}

Dataset.prototype.prefixTableName = function(tableName) {
	log.red('prefixTableName', tableName)

	return this.config.DISTANCE_MEASURE.replace(/-/g, '_') 
		+ '_x_validation_run_'
		+ this.config.CROSS_VALIDATION_RUN 
		+ '_' + tableName
}







function Movielens(filepath, name) {
	Dataset.call(this, filepath, name)
	this.separator 		= '::'
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:0,
		itemId:1,
		rating:2,
		timestamp:3
	}
}

/**
 * Movielens.prototype needs to be an object which itself has the prototype of Dataset.
 * This Movielens.prototype object must have the constructor value Movielens though.
 * @type {[type]}
 */
Movielens.prototype = Object.create(Dataset.prototype, {
	constructor: { value: Movielens	}
});



function LastFm(filepath, name) {
	//userid-timestamp-artid-artname-traid-traname
	
	Dataset.call(this, filepath, name)
	
	this.separator = '\t'
	this.timeDistance = 900 //15 mins
	this.indices = {
		userId:0,
		itemId:1,
		timestamp:3
	}
}

LastFm.prototype = Object.create(Dataset.prototype, {
	constructor: { value: LastFm }
})

function Gowalla(filepath, name) {
	// //userid-timestamp-artid-artname-traid-traname
	Dataset.call(this, filepath, name)
	this.separator = '\t'
	//this.timeDistance =  31536000
	this.timeDistance = 43200 //24 hours
	this.timeDistance = 
	this.indices = {
		userId:0,
		itemId:4,
		timestamp:1
	}
}
Gowalla.prototype = Object.create(Dataset.prototype, {
	constructor: { value: Gowalla }
})




function TestDataset(filepath, name) {
	Dataset.call(this, filepath, name)
	
	this.separator 		= '::'
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:0,
		itemId:1,
		rating:2,
		timestamp:3
	}
}
TestDataset.prototype = Object.create(Dataset.prototype, {
	constructor: { value: TestDataset }
})

// Movielens.prototype 				= Dataset.prototype
// Movielens.prototype.constructor 	= Movielens

// LastFm.prototype 					= Dataset.prototype
// LastFm.prototype.constructor 		= LastFm

// TestDataset.prototype 				= Dataset.prototype
// TestDataset.prototype.constructor 	= TestDataset
// exports.TestDataset = TestDataset

// Gowalla.prototype 					= Dataset.prototype
// Gowalla.prototype.constructor 		= Gowalla


var datasetInstance = null
var gowalla 		= new Gowalla('gowalla/checkins.txt', 					'gowalla');
var gowallaSmall  	= new Gowalla('gowalla/checkins_small.txt', 			'gowalla_small'); 
var lastFm 			= new LastFm('lastfm-dataset-1K/feedback.tsv', 			'last_fm')
var lastFmSmall 	= new LastFm('lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
var movielens 		= new Movielens('movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m')
var movielensCustom = new Movielens('movielens/ratings-custom-large.dat',	'movielens_custom_large') 
var movielensSmall 	= new Movielens('movielens/ratings-small.dat',			'movielens_small') 
var testDataset 	= new TestDataset('test/ratings.dat', 					'test_dataset')

exports.movielens = movielens
exports.testDataset = testDataset
exports.movielensSmall = movielensSmall
exports.movielensCustom = movielensCustom
exports.gowallaSmall = gowallaSmall
exports.lastFmSmall = lastFmSmall

exports.init = function(datasetName) {
	switch(datasetName) {
		case 'gowalla': 
			datasetInstance = gowalla
			break;
		case 'gowalla_small': 
			datasetInstance = gowallaSmall
			break;
		case 'last_fm': 
			datasetInstance = lastFm
			break;
		case 'last_fm_small': 
			datasetInstance = lastFmSmall
			break;
		case 'movielens_1m': 
			datasetInstance = movielens
			break;
		case 'movielens_custom_large': 
			datasetInstance = movielensCustom
			break;
		case 'test_dataset': 
			datasetInstance = testDataset
			break;
		default: throw 'invalid dataset name given'
	}
}



exports.dataset = function() {

	if(!datasetInstance) {

		console.log('CREATING NEW DATASET INSTANCE')
		//datasetInstance = new Gowalla('gowalla/checkins.txt',			'gowalla')
		datasetInstance = gowallaSmall

		//datasetInstance = new LastFm('lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
		//datasetInstance = new LastFm('lastfm-dataset-1K/feedback.tsv', 		'last_fm')
		
		
		//datasetInstance = new Movielens('movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m')
		//datasetInstance = new Movielens('movielens/ratings-custom-large.dat',	'movielens_custom_large')
		
		//datasetInstance = new Movielens('movielens/ratings-custom.dat', 		'movielens_custom')
		//datasetInstance = new Movielens('movielens/ratings-small.dat', 		'movielens_small')
		//datasetInstance = new Movielens('movielens/ml-10M100K/ratings.dat', 	'movielens_10m')
		
		//datasetInstance = new TestDataset('test/ratings.dat', 	'test_dataset')
	}

	return datasetInstance
}

exports.all = [gowalla, movielens, lastFm]
exports.all = [
	lastFmSmall,
	movielensSmall,
	movielensCustom, 
	gowallaSmall,
]

exports.all = [movielensCustom]

