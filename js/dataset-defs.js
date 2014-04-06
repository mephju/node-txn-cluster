
function Dataset() {
	this.dbTable = null
}

Dataset.prototype.db = function() {
	return '/home/mephju/stuff/datasets/daport/' + this.dbTable + '.sqlite'
	//return ':memory:'
}

function Movielens(datasetPath, dbTable) {
	this.dbTable = dbTable
	this.datasetPath = datasetPath
	this.separator = '::'
	this.timeDistance = 900 //15 mins
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
	return new LastFm('/home/mephju/stuff/datasets/lastfm-dataset-1K/feedback_small.tsv', 	'last_fm_small')
	//return new LastFm('/home/mephju/stuff/datasets/lastfm-dataset-1K/feedback.tsv', 		'last_fm')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-custom.dat', 		'movielens_custom')
	//return new Movielens('/home/mephju/stuff/datasets/movielens/ratings-small.dat', 		'movielens_small')
		//new Movielens('/home/mephju/stuff/datasets/movielens/ratings-custom.dat', 		'movielens_custom'),
		
		//new Movielens('/home/mephju/stuff/datasets/movielens/ml-1m/ml-1m/ratings.dat', 	'movielens_1m'),
		//new Movielens('/home/mephju/stuff/datasets/movielens/ml-10M100K/ratings.dat', 	'movielens_10m'),
	
	
}
