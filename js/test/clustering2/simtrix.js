var sim			= require('../../clustering2/sim')
var simtrix 	= require('../../clustering2/simtrix')
var Simtrix 	= simtrix.Simtrix


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
	
	var simMatrix = new Simtrix(txnRows)
	var matrix = simMatrix.matrix

	console.log(matrix)

	it('should return correct similarity', function() {
		var simil = matrix[0][0]
		assert.equal(1, simil)


		simil = sim.calcSim(txnRows[1]['item_ids'], txnRows[0]['item_ids'])
		assert.equal(simil, matrix[1][0])
		assert.equal(simil, matrix[0][1])
	})

})

