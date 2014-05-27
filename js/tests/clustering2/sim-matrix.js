var simMatrix 	= require('../../clustering2/sim-matrix')
var simMatrixDb	= require('../../clustering2/sim-matrix-db')
var clustering 	= require('../../clustering2/clustering')

var help		= require('../../help')

var assert 		= require('assert')
var async		= require('async')


var txnRows = [
	{ txn_id:100, item_ids:[1,2,3,4,5] },
	{ txn_id:200, item_ids:[1,2,3,4,5,6] },
	{ txn_id:300, item_ids:[2,3,4,5] },
	{ txn_id:400, item_ids:[3,4,5,6,7] },
	{ txn_id:500, item_ids:[1,2,7,6,5] },
	{ txn_id:600, item_ids:[10,12,13,14,15] },
	{ txn_id:700, item_ids:[1,12,13,4,15] },
	{ txn_id:800, item_ids:[11,12,17,14,18] },
	{ txn_id:900, item_ids:[21,22,23,4,5] },
	{ txn_id:1000, item_ids:[1,2,23,24,25] },
	{ txn_id:1100, item_ids:[1,2,23,24,25,1,5] },
	{ txn_id:1200, item_ids:[15,25,35,14,15] },
	{ txn_id:1300, item_ids:[1,2,3,4,5,4,5,4,5] },
	{ txn_id:1400, item_ids:[1,2,3,4,5,1,2,3,4,5,1,2,3,4,5] },
	{ txn_id:1500, item_ids:[1,2,3,4,5,6,7,10,20,21,22,23,24] },
	{ txn_id:1600, item_ids:[1,2,3,4,5,5,6,6,6,6,6,7] },
]



describe('Build Similarity Matrix From Txn Rows', function() {
	
	var matrix = simMatrix.buildMatrixFromTxns(txnRows)


	it('should give correct row for txn id', function() {
		var row = matrix.getRowForTxnId(100)
	})

	it('should return correct similarity', function() {
		var sim = matrix.getSim(100, 100)
		assert.equal(1, sim)
	})

})


describe('Build Similarity Matrix From Db', function() {
	var matrix = simMatrix.buildMatrixFromTxns(txnRows)

	var cmpMatrices = function(m1, m2) {
		var len = m1.txnRows.length
		for(var i=0; i<len; i++) {
			if(m1.txnRows[i]['txn_id'] !== m2.txnRows[i]['txn_id']) { 
				console.log('failed txnid check')
				return false 
			}
			if(!help.arrayEqual(m1.matrix[i], m2.matrix[i])) { 

				console.log('failed matrix sim row check')
				console.log(m1)
				console.log('-----------------------------')
				console.log(m2)
				return false 
			}
		}

		return true
	}

	it('inserting matrix should work', function(done) { 
		simMatrixDb.insertSimMatrix(matrix, done)
	})

	it('reading matrix from db should work', function(done) {
		simMatrixDb.getSimMatrix(done, txnRows)
	})

	it('stored and retrieved matrix should be the same', function(done) {
		async.waterfall([
			function(next) {
				simMatrixDb.getSimMatrix(next, txnRows)
			},
			function(txnRows, matrixSimRows, next) {
				var Matrix = simMatrix.Matrix
				var matrixFromDb = new Matrix(txnRows, matrixSimRows)
				
				assert.equal(cmpMatrices(matrixFromDb, matrix), true)
				done(null)
			}
		], done)
	})
})


describe('Clustering', function() {

	it('init', function(done) {
		async.waterfall([
			function(next) {
				simMatrixDb.getSimMatrix(next, txnRows)
			},
			function(txnRows, matrixSimRows, next) {
				var Matrix = simMatrix.Matrix
				var matrixFromDb = new Matrix(txnRows, matrixSimRows)
				
				clustering.cluster(txnRows, matrixFromDb, next)
			},
			function(clusterGroup, next) {
				done()
			}
		])
	})
		
})


