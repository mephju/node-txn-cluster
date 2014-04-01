//	
//	get all txnIds from db
//	for each txnId
//		get all itemIds of txnId
//		sort itemIds ASC
//		create sets of itemIds
//		do
//			determine support for each set
//			save support in object
//			filter out infrequent sets
//			extend each remaining set
//		while sets can be extended
//			
//		
//			
//		generate powerset of those itemIds
//		increase count for each set within the power set
//		

//var db 				= require('./db').db
var util 			= require('util')
var datasetDefs 	= require('../dataset-defs')
var datasets 		= datasetDefs.datasets()
var dataminerStore 	= require('./dataminer-store')
var dminerItemsets 	= require('./dataminer-itemsets3')
var async 			= require('async')



var getTxnIdsStmt = function(table) {
	return util.format(
		'SELECT txn_id FROM %s', 
		table + '_txns')
}

var getTxnItemsStmt = function(table) {
	return util.format(
		'SELECT item_id FROM %s WHERE txn_id=?', 
		table + '_txn_items')
}




var mine = exports.mine = function(dataset, callback) {
	getTxnIds(dataset, function(txnIds) {

		

		var forEachTxnId = function(txnIds, callback) {
			var txnId = txnIds.shift()
			if(txnId) {
				getTxnItems(txnId, dataset, function(itemIds) {
					//console.log(itemIds)
					//all itemIds of an txnId are the txn itself
					countItemsets(itemIds)
					forEachTxnId(txnIds, callback)
				})
			} else {
				callback()
			}
		}
		forEachTxnId(txnIds.slice(0), function() {
			console.log('done getting all txns')
			console.log(itemsetCounts)
		})
	})
}






var getTxnItems = function(txnId, dataset, callback) {
	var itemIds = []
	db.each(getTxnItemsStmt(
		dataset.dbTable),
		txnId, 
		function(e, row) {
			e	&& console.log(e) 				//then
				|| itemIds.push(row['item_id'])	//else
		},
		function(e, numRows) {
			e && console.log(e)
			callback(itemIds)
		}
	);
}




var getTxnIds = function(dataset, callback) {
	var txnIds = []
	db.each(getTxnIdsStmt(
		dataset.dbTable), 
		function(e, row) {
			e	&& console.log(e) 				//then
				|| txnIds.push(row['txn_id'])	//else
		},
		function(e, numRows) {
			callback(txnIds)
		}
	);
}

var countItemsets = function(txn) {
	var sets = genSubsets(txn)
	
	console.log
}




var start = function(datasets) {
	var ds = datasets.shift()
	if(ds) {
		mine(ds, function() {
			start(datasets)
		})
	} else {
		console.log('done')
	}
}
//start(datasets)
var t = [ 3186,
  1022,
  1270,
  1721,
  2340,
  1836,
  3408,
  1207,
  2804,
  260,
  720,
  1193,
  919,
  608,
  2692,
  1961,
  2028,
  3105,
  123,
  143123342,
  13232,
  124,
  455,
  1,
  2,3,4,5,6,7,8,9,10,11, ]

x = [ 3186,
  1022,
  1270,
  1721,
  2340,
  1836,
  3408,
  1207,
  2804,
  260,
  720,
  1193,
  919,
  608,
  2692,
  1961,
  2028,
  3105,
  123,
  143123342,
  13232,
  124,
  455]

 

x = [ 3186,
  1022,
  1270,
  1721,
  2340,
  1836,
  3408,
  1207,
  2804,
  260,
  720,
  1193,
  123,
  143123342,
  13232,
  124,
  455]

x = [0,1,2,3,4,5,6,7,8,9.10,11,12]


var t = [
150885,
150884,
149822,
150048]

async.series([
	function(next) {
		dataminerStore.prepare(next)
	},
	function(e) {
		console.log('dminestore.prepared')
		e && console.log(e)
		var datasets = datasetDefs.datasets()
		
		async.eachSeries(
			datasets,
			function(dataset, next) {
				dminerItemsets.countTxn(dataset, t, function(err) {
					console.log('returning from itemset miner')
					next(err)
				})	
			},
			function(err) {
				err && console.log('there was an error ')
			}
		);
			
	}
	// function(next) {
	// 	var itemsets = []
	// 	console.log('preparing array')
	// 	for(var i=0; i<10000000; i++) {
	// 		itemsets.push([i])
	// 	}

	// 	dataminerStore.addItemsets(itemsets, next)
	// },
	// function() {
	// 	console.log('added lot of items')
	// }
])