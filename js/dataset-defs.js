var fs 		= require('fs')
var async 	= require('async')


var baseDatasetPath = '/home/kokirchn/thesis/'
//var baseDatasetPath = '/stuff/datamining/'

function Dataset() {
	this.dbTable = null
	this.datasetSize = 0
	this.trainingSize = 0
}

Dataset.prototype.dataDir = function() {
	return baseDatasetPath + 'datasets/'
}

Dataset.prototype.db = function() {
	return baseDatasetPath + 'results/' + this.dbTable + '.sqlite'
	//return ':memory:'
}

Dataset.prototype.resultDbPath = function() {
	return baseDatasetPath + 'results/evaluation-results' + '.sqlite'
}





function Movielens(datasetPath, dbTable) {
	this.dbTable 		= dbTable
	this.datasetPath 	= this.dataDir() + datasetPath
	this.separator 		= '::'
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:0,
		itemId:1,
		rating:2,
		timestamp:3
	}
}

function LastFm(datasetPath, dbTable) {
	//userid-timestamp-artid-artname-traid-traname
	
	this.dbTable = dbTable
	this.datasetPath 	= this.dataDir() + datasetPath
	this.separator = '\t'
	this.timeDistance = 900 //15 mins
	this.indices = {
		userId:0,
		itemId:1,
		timestamp:3
	}
}


function Gowalla(datasetPath, dbTable) {
	// //userid-timestamp-artid-artname-traid-traname
	
	this.dbTable = dbTable
	this.datasetPath 	= this.dataDir() + datasetPath
	this.separator = '\t'
	//this.timeDistance =  31536000
	this.timeDistance = 86400 //24 hours
	this.indices = {
		userId:0,
		itemId:4,
		timestamp:1
	}
}





function TestDataset(datasetPath, dbTable) {
	this.dbTable 		= dbTable
	this.datasetPath 	= this.dataDir() + datasetPath
	this.separator 		= '::'
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:0,
		itemId:1,
		rating:2,
		timestamp:3
	}
}

Movielens.prototype 				= Dataset.prototype
Movielens.prototype.constructor 	= Movielens

LastFm.prototype 					= Dataset.prototype
LastFm.prototype.constructor 		= LastFm

TestDataset.prototype 				= Dataset.prototype
TestDataset.prototype.constructor 	= TestDataset
exports.TestDataset = TestDataset

Gowalla.prototype 					= Dataset.prototype
Gowalla.prototype.constructor 		= Gowalla



exports.dataset = function() {


	return new Gowalla('gowalla/checkins.txt',			'gowalla')
	//return new Gowalla('gowalla/checkins_small.txt',	'gowalla_small')

	//return new LastFm('lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
	//return new LastFm('lastfm-dataset-1K/feedback.tsv', 		'last_fm')
	
	//return new Movielens('movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m')
	//return new Movielens('movielens/ratings-custom-large.dat',	'movielens_custom_large')
	

	//return new Movielens('movielens/ratings-custom.dat', 		'movielens_custom')
	//return new Movielens('movielens/ratings-small.dat', 		'movielens_small')
	//return new Movielens('movielens/ml-10M100K/ratings.dat', 	'movielens_10m')
	
	//return new TestDataset('test/ratings.dat', 	'test_dataset')
}




Dataset.prototype.getDatasetSize = function(callback) {
	console.log('getDatasetSize')
	var num = 0
	fs
	.createReadStream(this.datasetPath)
	.on('data', function(chunk) {

		num += chunk
        .toString('utf8')
        .split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
        .length-1

        console.log('chun', num)
	})
	.on('end', function(){
		this.datasetSize = num
		console.log('end', this.datasetSize)
		callback(null, this.datasetSize)
	})
	.on('error', callback)
}
