var transMarkovInfo = require('../../transitions/trans-markov-info').test
var assert = require('assert')
var async = require('async')
var should = require('should')


var markovChain = {
	"3":{
    	"0":{
        	"0":18,
        	"3":1
    	},
    	"1":{
			"1":1
		}
    },
    "4":{
    	"0": {
    		"0":10,
    		"1":12
    	}
    }
}


var markovChain1st = {
	"3":{
        "0":18,
        "3":1
	},
	"1":{
		"1":1
	},
    "4":{
		"0":10,
    	"1":12
    }
}
var markovInfo1st = {
	"3":{
        "0":18,
        "3":1
	},
	"1":{
		"1":1
	},
    "4":{
		"0":10,
    	"1":12
    }
}



var after = { 
	'3': { 
		'0': { 
			'0': 18, 
			'3': 1, 
			sum: 19 
		},
     	'1': { 
     		'1': 1, 
     		sum: 1 
     	},
     	sum: 20 
     },
  	'4': { 
  		'0': { 
  			'0': 10, 
  			'1': 12, 
  			sum: 22 
  		}, 
  		sum: 22 
  	},
  	sum: 42 
}

var topClusters = [
	{sum:10, key:'0'},
	{sum:11, key:'1'},
	{sum:12, key:'2'},
	{sum:4, key:'3'},
];


describe('transMarkovInfo', function() {

	describe('MarkovInfo', function() {

		var MarkovInfo = transMarkovInfo.MarkovInfo
		
		describe('2nd Order', function(){
			var MarkovInfo = transMarkovInfo.MarkovInfo
			var markovInfo = new MarkovInfo(markovChain)
			
			it('should return top clusters for a 2-gram', function() {	
				var lastClusters = [3, 0]
				var topClusters = markovInfo.getTopClusters(2, lastClusters)

				topClusters[0].should.eql({idx:'0',sum:18})
				topClusters[1].should.eql({idx:'3',sum:1})

			})


			it('should return top cluster for a 1-gram', function() {
				var lastClusters = [3]
				var topClusters = markovInfo.getTopClusters(1, lastClusters)

				topClusters[0].should.eql({idx:'0',sum:19})
							
			})
		})





		describe('1st Order', function() {
			it('should build enriched markov chain', function() {
					
				var markovInfo = new MarkovInfo(markovChain1st)
				var lastClusters = [3]

				var topClusters = markovInfo.getTopClusters(2, lastClusters)

				topClusters[0].should.eql({idx:'0',sum:18})
				topClusters[1].should.eql({idx:'3',sum:1})
			})
		})
		
		
			


		
	})

	describe('getMinIdx', function() {
		it('should return idx 3', function() {
			
			var minIdx = transMarkovInfo.getMinIdx(topClusters)

			assert.equal(minIdx, 3)
		})
	})


	describe('addTopCluster', function() {
		var max = 3
		var topClusters = []
		
		var candidate = {
			key: '1',
			sum: 20
		}

		it('should have length of 3 after adding', function() {
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			assert.equal(3, topClusters.length)	
		})
		

		it('never exceeds max', function() {
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			assert.equal(3, topClusters.length)	
		})

		it('smaller candidates are not added', function() {
			var candidate = {
				key:'0',
				sum:10
			};
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			topClusters.forEach(function(cluster) {
				assert.equal(cluster.key, 1)
			})
		})

		it('larger candidates replace old ones', function() {
			var candidate = {
				key:'0',
				sum:30
			};
			transMarkovInfo.addTopCluster(candidate, max, topClusters)
			var found = false
			topClusters.forEach(function(cluster) {
				if(cluster.key === '0') {
					found = true
				}
			})
			assert.equal(found, true)
		})

	})
})