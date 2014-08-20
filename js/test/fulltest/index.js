var async = require('async')
var should = require('should')

var defs = require('../../dataset-defs')
defs.dataset = function() {
	var TestDataset = defs.TestDataset
	return new TestDataset('test/ratings.dat', 	'test_dataset')
}

var config 		= require('../../config')
var dataset 	= require('../../dataset-defs').dataset()
var sqlite3 	= require('sqlite3').verbose();
var db 			= new sqlite3.Database(dataset.db())
var rootDb 		= require('../../db')



describe('import', function() {
	
	var importer = require('../../import/app')
	
	it('imports feedback correctly', function(done) {
		this.timeout(99999999)
		async.waterfall([
			function(next) {
				importer.makeImport(next)
			},
			function(next) {
				rootDb.getTableSize('feedback', next)
			},
			function(size, next) {
				size.should.equal(50)
				db.all('select distinct user_id from feedback', next)
			},
			function(rows, next) {
				console.log(rows)
				rows.length.should.equal(10)
				next(null)
			}
		], done)
	})
})


describe('transactions', function() {
	var txnApp = require('../../transactions/app')
	it('are built and stored correctly', function(done) {
		this.timeout(999999)
		async.waterfall([
			function(next) {
				txnApp.buildTxns(next)
			},
			function(next) {
				rootDb.getTableSize('txns', next)
			},
			function(size, next) {
				size.should.equal(10)
				next(null)
			},
			function(next) {
				db.all('select * from txn_item_groups', next)
			},
			function(rows, next) {
				console.log(rows)
				rows.forEach(function(item, i) {
					item.item_ids.should.equal('1,2,3,4,5')
				})
				next(null)
			}
		], done)
	})
})


describe('most popular baseline', function() {
	var baseline = require('../../eval/most-popular')

	it('recommends 5 best items', function(done) {
		async.waterfall([
			function(next) {
				baseline.init(next)
			},
			function(next) {
				var popular = baseline.getPopularItemsForN(5)
				console.log(popular)
				popular.should.eql([1,2,3,4,5])
				done()
			}
		])
	})
})


describe('eval', function() {
	var eval = require('../../eval/index')
	config.RECOMMENDER = config.REC_APRIORI
	config.MIN_SUPPORT = 1

	it('computes correct precision for baseline', function(done) {
		config.BASELINE_ON = true
		config.N = 4
		async.waterfall([
			function(next) {
				eval.start(next)
			},
			function(precision, next) {
				console.log(precision)
				precision.precB.should.equal(3/4)
				next()
			}
		], done)
	})
})