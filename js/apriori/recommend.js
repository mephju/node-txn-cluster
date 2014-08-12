var _			= require('lodash')
var async		= require('async')
var config		= require('../config')
var help 		= require('../help')




function Recommender(rules) {
	console.log('apriori.Recommender')
	this.rules = rules
} 


Recommender.prototype.getRecommendations = function(session, N) {
	
	var recs = []

	for(var s=session.length-1; s>=0; s--) {
		
		var item = session[s]
		var itemRules = this.rules[item]

		if(itemRules) {
			for(var i=0; i<itemRules.length; i++) {
				recs = _.union(recs, itemRules[i].consequent)	
				recs = _.difference(recs, session)

				if(recs.length >= N) {
					return recs
				}
			}
		}
		
	
	}
		

	return recs
	
}

exports.Recommender = Recommender