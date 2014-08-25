
// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant 
var help = require('../help')
var config = require('../config')


//Calculates the number of hits for two recommendations arrays respectively
//Can be used to compare real recommender against baseline.
var getHitsVs = function(sessionEnd, recommendations) {
	var hitsR = 0

	//console.log(sessionEnd, recommendations, baselineItems)
	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) !== -1) {
			hitsR++
		}			
	})
	return hitsR / recommendations.length
}

exports.getHitsVs 	= getHitsVs



