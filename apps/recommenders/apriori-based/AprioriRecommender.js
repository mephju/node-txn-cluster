var Recommender = require('../recommender')
var Apriori = require('./Apriori')
var fs = require('fs')

function AprioriRecommender(dataset) {
	this.dataset = dataset
	this.apriori = new Apriori(dataset)
	this.rules = null
}

module.exports = AprioriRecommender

AprioriRecommender.prototype = Object.create(Recommender.prototype, {
	constructor: AprioriRecommender
})


AprioriRecommender.prototype.init = function(done) {
	log.blue('AprioriRecommender.init')
	var self = this
	fs.readFile(this.apriori.filename, 'utf8', function(err, rules) {
		//log(rules)
		self.rules = JSON.parse(rules)
		done(err)
	})
}

AprioriRecommender.prototype.recommend = function(session) {
	var recs = []

	for(var s=session.length-1; s>=0; s--) {
		
		var item = session[s]
		var itemRules = this.rules[item]

		if(!itemRules) { return recs }
			
		for(var i=0; i<itemRules.length; i++) {
			for(var j=0; j<itemRules[i].consequent; j++) {
				recs.push(itemRules[i].consequent[j])
				if(recs.length === this.dataset.config.N) {
					return recs
				}
			}					
		}	
	}
		
	return recs
}

