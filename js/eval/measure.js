
// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant 
var help = require('../help')
var config = require('../config')


//Calculates the number of hits for two recommendations arrays respectively
//Can be used to compare real recommender against baseline.
/**
 * 
 * @param  {[type]} sessionEnd      [description]
 * @param  {[type]} recommendations [description]
 * @return {[type]}                 [description]
 */
var getHitsVs = function(sessionEnd, recommendations) {
	var hits = 0

	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) !== -1) {
			hits++
		}			
	})
	return hits / recommendations.length //TODO this could also be config.N as the number of recommendations should always be 5???!
}


var precision = function(relevant, retrieved) {
	var hits = 0

	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) !== -1) {
			hits++
		}			
	})
	return hits / recommendations.length
}

exports.precision = precision
exports.getHitsVs 	= getHitsVs



