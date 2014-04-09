var fs 		= require('fs')
var async 	= require('async')

function Dataset() {
	this.dbTable = null
	this.datasetSize = 0
	this.trainingSize = 0
	
}

Dataset.prototype.db = function() {
	return '/home/mephju/stuff/datasets/daport/' + this.dbTable + '.sqlite'
	//return ':memory:'
}

Dataset.prototype.getDatasetSize = function(callback) {
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
	this.timeDistance = 360 //6 mins
}

function LastFm(datasetPath, dbTable) {
	//userid-timestamp-artid-artname-traid-traname
	this.dbTable = dbTable
	this.datasetPath = datasetPath
	this.separator = '\t'
	this.timeDistance = 300 //5 mins
}

Movielens.prototype 			= Dataset.prototype
Movielens.prototype.constructor = Movielens
LastFm.prototype 				= Dataset.prototype
LastFm.prototype.constructor 	= LastFm




exports.dataset = function() {
	//return new LastFm('/home/mephju/stuff/datasets/lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
	//return new LastFm('/home/mephju/stuff/datasets/lastfm-dataset-1K/feedback.tsv', 		'last_fm')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-custom.dat', 		'movielens_custom')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-small.dat', 		'movielens_small')
	return new Movielens('/home/mephju/stuff/datasets/movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ml-10M100K/ratings.dat', 	'movielens_10m')
	
	
}
