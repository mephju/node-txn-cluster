
var mongo 		= require('mongodb')
var MongoClient = mongo.MongoClient
var format 		= require('util').format;
var async		= require('async')

var db 		

var itemsetsRead
const BATCH_SIZE = 75000
const MONGO_DB = false

var prepare = exports.prepare = function(callback) {			

	console.log('dminestore.prepare')


	if(!MONGO_DB) {
		console.log('working with relational db')
		var sqlite3 = require('sqlite3').verbose();
		db 			= new sqlite3.Database('../../data/itemsets.db')
		console.log('db opened')
		db.run('CREATE TABLE IF NOT EXISTS itemsets (itemset TEXT, count INTEGER)')
		db.run('DELETE FROM itemsets', function(e) {
			callback(e)
		})
	} else {
		async.waterfall([
			function initMongo(callback) {
				MongoClient.connect('mongodb://127.0.0.1:27017/txns', callback)
			},
			function initCollections(mongoDb, callback) {
				db = mongoDb
				itemsetsRead = db.collection('itemsets')

				itemsetsRead.remove(callback)
			},
		], function(err, results) {
			if(err) {
				console.log(err)
			} else {
				callback(null)	
			}					
		})	
	}
	
	
		

	
		
}





var close = exports.close = function() {
	if(db) db.close()
}





var readItemset = exports.readItemset = function(callback) {

	async.waterfall([
		function(cb) {
			itemsetsRead.findOne(cb)
		}, 
		function(itemsetDoc, cb) {
			if(itemsetDoc) {
				itemsetsRead.remove({'_id':itemsetDoc._id}, function() {
					callback(null, itemsetDoc.itemset)
				})
			} else {
				callback(null, null)
			}
		}
	], function(err) {
		err && console.log(err)
	})
}




var readItemsets = exports.readItemsets = function(callback) {
	var itemsets = []
	var docIds = []

	
	itemsetsRead
	.find({}, {limit:BATCH_SIZE})
	.toArray(function(err, docs) {
		console.log('readItemsets', docs.length)
		err && console.log(err)
		docs.forEach(function(doc) {
			itemsets.push(doc.itemset)
			docIds.push(doc._id)
		})

		removeItemsets(docIds, function()  {
			callback(null, itemsets)
		})
			
	})
	
	
		

}


//db.users.remove({_id:{$in:[id1, id2, id3, ... ]}})
var removeItemsets = function(docIds, next) {

	async.series([ 
		function(next) {
			itemsetsRead.remove({_id: {$in:docIds} }, next)	
		},
		function(e) {
			console.log('removed itemsets', docIds.length)
			e && console.log(e)
			next(e)
		}
	]);
}



var saveItemsetCounts = exports.saveItemsetCounts = function(doc, callback) {
	db.collection('itemset_counts').insert(doc, callback)
}

var addItemset = exports.addItemset = function(itemset, callback) {
 	itemsetsRead.insert({'itemset':itemset}, callback)
}


var addItemsets2 = exports.addItemsets2 = function(itemsets, callback) {
	if(itemsets.length == 0) { 
		callback(null) 
	}
	else {
		console.log('addItemsets', itemsets.length)

		console.log('insert batches')
		db.run('BEGIN TRANSACTION')
		async.eachSeries(
			itemsets,
			function(itemset, next) {
				db.run('INSERT INTO itemsets(itemset) VALUES($1)', JSON.stringify(itemset), next)
			}, 
			function(e) {
				db.run('END TRANSACTION')
				callback(e)
			}
		);		
	}
}
var readItemsets2 = exports.readItemsets2 = function(callback) {
	
	async.waterfall([
		function(next) {
			db.all('SELECT itemset from itemsets LIMIT 50000', next)		
		},
		function(rows, next) {
			var itemsets = rows.map(function(row) { 
				return JSON.parse(row['itemset'])
			})
			next(null, itemsets)
		},
		function(itemsets) {
			db.run('DELETE FROM itemsets WHERE rowid in (SELECT rowid FROM itemsets ORDER BY rowid LIMIT 50000)', function(e) {
				callback(null, itemsets)		
			})
		}
	])
	
}



var addItemsets = exports.addItemsets = function(itemsets, callback) {
	if(itemsets.length == 0) { 
		callback(null) 
	}
	else {
		var docs = []
		itemsets.forEach(function(set) {
			docs.push({'itemset':set})
		})
		console.log('addItemsets', docs.length)

		
		var numBatches = Math.ceil(docs.length/BATCH_SIZE)

		var batches = []
		for(var i=0; i<numBatches; i++) {
			batches[i] = docs.splice(0,BATCH_SIZE)	
		}

		console.log('insert batches')
		async.eachSeries(
			batches,
			function(batch, next) {
				console.log('inserting batch')

				itemsetsRead.insert(batch, function(e) {
					if(e) {
						console.log(e)
						console.log('repairing db')
						async.series([
							function(next) {
								db.command({repairDatabase:1}, next)
							},
							function() {
								itemsetsRead.insert(batch, next)	
							}
						])
					} else {
						next()
					}
				})			
			}, 
			function(e) {
				if(e) {
					
				} else {
					console.log('inserting done', e || 'no error')
					callback(e)
				}
			}
		);
				

		// async.eachSeries(
		// 	docs,
		// 	function(doc, next) {
		// 		itemsetsRead.insert(docs, next)		
		// 	},
		// 	function(err) {
		// 		callback(err)
		// 	}
		// )
		
	}
}








// prepare(function() {
// 	console.log('prepared')
// 	addItemset([1,2,3], function() {
// 		console.log('added itemset')
		
// 		nextLevel(function(e) {
// 			addItemset([1,2,4], function() {
// 				console.log('added itemset')
// 				readItemsets(function(itemset) {
// 					console.log('readitemsets', itemset)
// 				}, function() {
// 					close()
// 				})
// 			})
// 		})
// 	})
// })