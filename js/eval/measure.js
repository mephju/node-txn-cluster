
// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant 


var prec = function(sessionEnd, recommendations) {
	var hits = sessionEnd.filter(function(item) {
		return recommendations.indexOf(item) != -1
	})
	return hits
}



var getHits = function(sessionEnd, recommendations) {
	var hits = 0
	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) != -1) {
			hits++
		}
	})
	return hits
}


var getHitsVs = function(sessionEnd, recommendations, baselineItems) {
	var hitsR = 0
	var hitsB = 0
	sessionEnd.forEach(function(item) {
		if(recommendations.indexOf(item) != -1) {
			hitsR++
		}
		if(baselineItems.indexOf(item) != -1) {
			hitsB++
		}
	})
	return {
		hitsR: hitsR,
		hitsB: hitsB
	}
}

exports.getHitsVs 	= getHitsVs
exports.getHits 	= getHits
exports.precision 	= prec


