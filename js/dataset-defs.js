var fs 		= require('fs')
var async 	= require('async')

function Dataset() {
	this.dbTable = null
	this.datasetSize = 0
	this.trainingSize = 0
}

Dataset.prototype.dataDir = function() {
	return '/home/kokirchn/thesis/results/daport/v4/'
}

Dataset.prototype.db = function() {
	return this.dataDir() + this.dbTable + '.sqlite'
	//return ':memory:'
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

function Movielens(datasetPath, dbTable) {
	this.dbTable = dbTable
	this.datasetPath = datasetPath
	this.separator = '::'
	this.timeDistance = 300 // 5 mins
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
	this.datasetPath = datasetPath
	this.separator = '\t'
	this.timeDistance = 900 //15 mins
	this.indices = {
		userId:0,
		itemId:1,
		timestamp:3
	}
}

function Netflix(datasetPath, dbTable) {
	//itemID,userID,Rating,timestamp
	this.dbTable 		= dbTable
	this.datasetPath 	= baseDatasetPath + datasetPath
	this.separator 		= ','
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:1,
		itemId:0,
		rating:2,
		timestamp:3
	}
}

function Epinions(datasetPath, dbTable) {
	//ITEM_ID, MEMBER_ID, RATING, STATUS, CREATION,LAST_MODIFIED, TYPE, VERTICAL_ID
	this.dbTable 		= dbTable
	this.datasetPath 	= baseDatasetPath + datasetPath
	this.separator 		= ','
	this.timeDistance 	= 300 // 5 mins
	this.indices = {
		userId:1,
		itemId:0,
		rating:2,
		timestamp:4
>>>>>>> origin/master
	}
}


function TestDataset(datasetPath, name) {
	this.dbTable = name
	this.datasetPath = datasetPath
	this.separator = '::'
	this.timeDistance = 300
}

Movielens.prototype 				= Dataset.prototype
Movielens.prototype.constructor 	= Movielens

LastFm.prototype 					= Dataset.prototype
LastFm.prototype.constructor 		= LastFm

TestDataset.prototype 				= Dataset.prototype
TestDataset.prototype.constructor 	= TestDataset

Epinions.prototype 					= Dataset.prototype
Epinions.prototype.constructor 		= Epinions


exports.dataset = function() {
<<<<<<< HEAD
	//return new LastFm('/home/kokirchn/thesis/datasets/lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
	//return new LastFm('/home/kokirchn/thesis/datasets/lastfm-dataset-1K/feedback.tsv', 		'last_fm')
=======
	return new Epinions('epinions/epinions_custom_small.txt', 'epinions_custom_small')
	//return new Epinions('epinions/epinions_extended_sorted.txt', 'epinions')
	//return new Netflix('netflix/netflix_sorted.txt')

	//return new LastFm('lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
	//return new LastFm('lastfm-dataset-1K/feedback.tsv', 		'last_fm')
>>>>>>> origin/master
	
	
	return new Movielens('/home/kokirchn/thesis/datasets/movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m')
	//return   new Movielens('/home/kokirchn/thesis/datasets/movielens/ratings-custom-large.dat',	'movielens_custom_large')
	

	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-custom.dat', 		'movielens_custom')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-small.dat', 		'movielens_small')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ml-10M100K/ratings.dat', 	'movielens_10m')
	
	//return new TestDataset('/home/mephju/stuff/datasets/movielens/ml-1m/ml-1m/ratings.dat', 	'test_dataset')
}
