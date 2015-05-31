var Cluster = require('./cluster')

var should = require('should')


describe('Cluster', function() {
	// it('buildSimMatrix() works', function() {
	// 	var matrix = Cluster.buildSimMatrix(members, )
	// })

	it('sumRow() works', function() {
		var matrix = [
			[null,1,2,3], 			//0,1,2,3 = 6
			[null,null,5,10], 		//1,0,5,10 = 16
			[null,null,null,20], 	//2,5,0,20 = 27
			[null,null,null,null] 	//3,10,20,0 = 33
		];

		var sum1 = Cluster.sumRow(matrix, 0) 
		var sum2 = Cluster.sumRow(matrix, 1) 
		var sum3 = Cluster.sumRow(matrix, 2) 
		var sum4 = Cluster.sumRow(matrix, 3) 

		sum1.should.equal(6)
		sum2.should.equal(16)
		sum3.should.equal(27)
		sum4.should.equal(33)
	})
})