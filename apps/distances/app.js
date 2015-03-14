/*
 * 	movielens 		23000 txns 		05750 MB storage
 * 	lastfm 			61000 txns 		15250 MB storage
 * 	gowalla 		70000 txns 		17500 MB storage
 *
 * distances require 250 MB per 1000 txns 
 */

require('../init')




var Config = app.Config
log(app.Config)

var dataset = datasets.movielensCustom

dataset.config = new Config('levenshtein')

var DistanceRun = require('./distance-run').DistanceRun

async.waterfall([
	function(next) {
		new DistanceRun(dataset).run(next)
	},
	function(next) {
		log('done computing distances for', dataset.name, dataset.config.DISTANCE_MEASURE)
	}
], 
function(err) {
	log.red('error received', err)
})






