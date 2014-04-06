var setOps			= require('./sim-set-sim')
var levenshtein  	= require('./sim-levenshtein')

var calcSim = function(txn, frequentSeq) {
		
	var simLevenshtein 	= 1 - levenshtein.distanceNorm(txn, frequentSeq)
	var simSetSim 		= setOps.setSim(txn, frequentSeq)

	return (simLevenshtein * 2 + simSetSim) / 3
}

exports.calcSim = calcSim