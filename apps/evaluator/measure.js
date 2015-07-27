
// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant 



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
	// log('precision relevant', relevant)
	// log('precision retrieved', retrieved)
	var hits = 0

	relevant.forEach(function(item) {
		if(retrieved.indexOf(item) !== -1) {
			hits++
		}			
	})
	
	return hits / retrieved.length
}

var precision = function(txn, relevantStart, relevantEnd, retrieved) {
	
	var hits = 0

	for(var i=relevantStart; i<relevantEnd; i++) {
		if(retrieved.indexOf(txn[i]) !== -1) {
			hits++
		}
	}
	
	return hits / retrieved.length
}


exports.precision = precision
exports.getHitsVs 	= getHitsVs



