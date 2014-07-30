var config		= require('../../config')
var help		= require('../../help')
var assert 		= require('assert')
var should		= require('should')

var async		= require('async')

var numRecomm = require('../../recommend/num-recomm').test


describe('recommender', function() {

	describe('reduceOne()', function() {


		it('reduces sum of 90 to 45', function() {
			var topClusters = [
				{sum:60, key:'0'},
				{sum:15, key:'1'},
				{sum:10, key:'2'},
				{sum:5, key:'3'},
			];
			config.N = 5
			config.MAX_CONTRIBUTION = 0.5
			
			var totalSum = 90
			var i = 0
			var result = numRecomm.reduceOne(topClusters, totalSum, i)

			result[i].sum.should.equal(45)
			result[1].sum.should.equal(20)
			result[2].sum.should.equal(15)
			result[3].sum.should.equal(10)
		})
	})








	describe('reduceToMax()', function() {
		it('all sums are maximally 25%', function() {

			config.MAX_CONTRIBUTION = 0.25
			var topClusters = [
				{sum:900, key:'0'},
				{sum:90, key:'1'},
				{sum:1, key:'2'},
				{sum:1, key:'3'},
			];

			var totalSum = 992


			var result = numRecomm.reduceToMax(topClusters, totalSum)
			
			//console.log('res',result)

			totalSum = result.reduce(function(le, ri) {
				return { sum:le.sum+ri.sum }
			}).sum

		
			var perc = 0
			result.forEach(function(item, i) {
				var share = item.sum/totalSum
				perc += share

				share.should.be.within(0.25-0.00001, 0.25+0.00001)
			})

			perc.should.equal(1)
		})



		it('all sums are maximally 60%', function() {

			config.MAX_CONTRIBUTION = 0.6
			var topClusters = [ 
				{ idx: '17', sum: 69 },
				{ idx: '13', sum: 49 },
				{ idx: '3', sum: 4778 },
				{ idx: '9', sum: 67 },
				{ idx: '16', sum: 81 } 
			];

			var totalSum = topClusters.reduce(function(l,r) {
				return { sum: l.sum+r.sum }
			}).sum


			var result = numRecomm.reduceToMax(topClusters, totalSum)
			
			//console.log('res',result)

			totalSum = result.reduce(function(le, ri) {
				return { sum:le.sum+ri.sum }
			}).sum

		
			var perc = 0
			result.forEach(function(item, i) {
				var share = item.sum/totalSum
				perc += share
				share.should.not.be.above(0.6 + 0.01)

			})

			perc.should.equal(1)
		})
	})









	describe('computeNumRecomms()', function() {


		it.only('no cluster contributes more than 0.6', function() {
			var topClusters = [ 
				{ idx: '20', sum: 3 },
				{ idx: '3', sum: 2 },
				{ idx: '6', sum: 2 },
				{ idx: '9', sum: 56 },
				{ idx: '16', sum: 3 } 
			];


			config.N = 5
			config.MAX_CONTRIBUTION = 0.6
			var max = Math.round(config.N*config.MAX_CONTRIBUTION)

			var result = numRecomm.computeNumRecomms(topClusters)

			topClusters.forEach(function(item, i) {
				item.numRecomms.should.not.be.above(max)
			})

			console.log('\n', result)
		})


		it('returns', function() {
			var topClusters = [ 
				{ idx: '17', sum: 69 },
				{ idx: '13', sum: 49 },
				{ idx: '3', sum: 4778 },
				{ idx: '9', sum: 67 },
				{ idx: '16', sum: 81 } 
			];

			config.N = 5
			config.MAX_CONTRIBUTION = 0.6
			var max = Math.round(config.N*config.MAX_CONTRIBUTION)

			var result = numRecomm.computeNumRecomms(topClusters)

			topClusters.forEach(function(item, i) {
				item.numRecomms.should.not.be.above(max)
			})

			console.log('\n', result)
		})

		it('returns numrecomms where no cluster contributes more than 50% of items', function() {
			var topClusters = [
				{ sum:60, key:'0'},
				{ sum:15, key:'1'},
				{ sum:10, key:'2'},
				{ sum:5, key:'3'},
			];
			config.N = 5
			config.MAX_CONTRIBUTION = 0.5
			var max = Math.round(config.N*config.MAX_CONTRIBUTION)
			

			var result = numRecomm.computeNumRecomms(topClusters)

			//console.log(result)

			topClusters.forEach(function(item, i) {
				item.numRecomms.should.not.be.above(max)
			})

			//console.log(result)
		})
	})
})

