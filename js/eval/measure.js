
// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant 
var help = require('../help')
var config = require('../config')


//Calculates the number of hits for two recommendations arrays respectively
//Can be used to compare real recommender against baseline.
var getHitsVs = function(sessionEnd, recommendations, baselineItems) {
	var hitsR = 0
	var hitsB = 0

	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) !== -1) {
			hitsR++
		}
		if(config.BASELINE_ON && baselineItems.indexOf(item) !== -1) {
			hitsB++
		}
			
	})
	return {
		hitsR: hitsR,
		hitsB: hitsB
	}
}

exports.getHitsVs 	= getHitsVs



