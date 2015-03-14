

require('../apps/init')
var TxnModel 		= require('../apps/session-builder/transactions/model').Model
var DistanceStore  = require('../apps/trainer/similarity').DistanceStore
var datasets = require('../apps/datasets')
var should = require('should')


describe('DistanceStore', function() {
	var store = new DistanceStore(datasets.movielensSmall)

	it('can be built', function(done) {
		this.timeout(12000)

		async.waterfall([
			function(next) {
				store.build(txnRows, next)
			},
			function(next) {
				var txnRow = {
					item_ids: [3578, 501]
				}
				store.get(txnRow, next)
			},
			function(distanceMap, next) {
				
				distanceMap.distance([3578, 501, 34545]).should.be.greaterThan(0)
				distanceMap.distance([3578, 501]).should.equal(0)

				done()
			}
		], done)
		
	})
})









var txnRows = [ 
	{ txn_id: 13, 	item_ids: [ 3578, 501 ] },
  	{ txn_id: 11, 	item_ids: [ 31861, 1270, 1721, 1022, 2340, 1836, 3408 ] },
  	{ txn_id: 51,	item_ids: [ 3186, 12701, 1721, 1022, 2340, 1836, 3408 ] },
  	{ txn_id: 131, 	item_ids: [ 3578, 5011 ] },
  	{ txn_id: 12, 	item_ids: [ 3186, 1270, 1721, 10224, 23404, 1836, 3408 ] },
  	{ txn_id: 52,	item_ids: [ 3186, 1270, 1721, 10224, 23404, 18364, 3408 ] },
  	{ txn_id: 132, 	item_ids: [ 3578, 501 ] },
  	{ txn_id: 122, 	item_ids: [ 3186, 1270, 1721, 1022, 2340, 18364, 34084 ] },
  	{ txn_id: 537,	item_ids: [ 3186, 1270, 1721, 1022, 2340, 1836, 43408 ] },
  	{ txn_id: 133, 	item_ids: [ 3578, 3501 ] },
  	{ txn_id: 13, 	item_ids: [ 3186, 1270, 1721, 1022, 2340, 1836, 43408 ] },
  	{ txn_id: 54,	item_ids: [ 3186, 31270, 1721, 1022, 2340, 1836, 3408 ] },
  	{ txn_id: 134, 	item_ids: [ 3578, 3501 ] },
  	{ txn_id: 14, 	item_ids: [ 53186, 41270, 1721, 1022, 2340, 1836, 3408 ] },
  	{ txn_id: 544,	item_ids: [ 53186, 41270, 1721, 1022, 2340, 1836, 3408 ] },
  	{ txn_id: 1357, 	item_ids: [ 3578, 501 ] },
  	{ txn_id: 17, 	item_ids: [ 73186, 1270, 1721, 71022, 72340, 1836, 3408 ] },
  	{ txn_id: 57,	item_ids: [ 73186, 1270, 1721, 1022, 2340, 1836, 3408 ] }]

