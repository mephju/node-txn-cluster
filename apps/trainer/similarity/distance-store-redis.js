
var Distance = require('./distance').Distance

var redis 	= require('redis')
var client 	
= redis.createClient()

client.on('error', function(err) {
	throw err
})

// client.select(0, function(err, reply) {
// 	log('select', err, reply)
// })
// client.info(function(err, reply) {
// 	log(reply)
// })
 

function DistanceMap(map) {
	this.map = map
}
DistanceMap.prototype.distance = function(input) {
	if(input.constructor === Array)		return this._distance(input.toString())
	else if(typeof input === 'object') 	return this._distance(input['item_ids'].toString())
	else if(typeof input === 'string') 	return this._distance(input)
} 
DistanceMap.prototype._distance = function(key) {
	var d = this.map[key] 
	if(typeof d === 'undefined') {
		d = 1
	}
	//log('distance', key, d)
	return d
}



function DistanceStore(dataset) {
	log('new DistanceStore()')
	this.dataset = dataset
	this.preKey = dataset.name + '-' + dataset.config.DISTANCE_MEASURE + '-'
	this.client = client
	this.distanceMeasure = new Distance(dataset)
}



DistanceStore.prototype.load = function(next) {
	
}





exports.DistanceStore = DistanceStore

DistanceStore.prototype.get = function(txnRow, done) {
	process.stdout.write('.')
	var _this = this
	var txn = txnRow['item_ids'].toString()

	async.waterfall([
		function(next) {
			var doc = _this.db.findOne(
				{ _id:  txn.toString()}
			);

			next(null, doc)
		},
		function(doc, next) {

			if(!doc) {
				log('tried to find store for', txnRow) 
				throw new Error('could not find distance store') 
			}
			done(null, new DistanceMap(doc.distanceMap))
			//done(null, doc.distanceMap)
		}
	], done)
	
}



/**
 * Adds a new entry into the collection. The entry consists of the txn and its
 * corresponding distance map. the distance map contains all txns's distances to the entry's txn.
 * 
 * @param {[type]}   txnRow  [description]
 * @param {[type]}   txnRows [description]
 * @param {Function} done    [description]
 */
DistanceStore.prototype.add = function(txn, txnRows, done) {

	process.stdout.write('.')
	var map = {}

	for(var i=0; i<txnRows.length; i++) {
		var compareTxn = txnRows[i]['item_ids']
		map[compareTxn.toString()] = this.distanceMeasure.distance(
			txn, 
			compareTxn
		);
	}

	var doc = {
		_id: txn.toString(),
		distanceMap: map
	}
	log('inserting', doc)

	this.db.insert(doc)
	return done()	
}


DistanceStore.prototype.build = function(txnRows, done) {
	log('DistanceStore.build', txnRows.length)
	var _this = this
	

	var insertDistances = function(next) {
		log.yellow('insertDistances')
		async.eachSeries(
			txnRows,
			function(txnRow, next) {
				_this.add(txnRow['item_ids'], txnRows, next)
			},
			function(err) {
				_this.store.save()
				log('all distance maps created')
				next()
			}
		);	
	}


	async.waterfall([
		function(next) {
			this.db.removeWhere({})
			next()	
		}.bind(this),
		// function(numRemoved, next) {
		// 	this.db.removeIndex('txn', next)
		// }.bind(this),
		// function(next) {
		// 	this.db.insert({txn:'1019834208sd134782374akjasldkfhsfdh8902'}, next)
		// }.bind(this),
		// function(doc, next) {
		// 	next()
		// }.bind(this),
		insertDistances.bind(this),
		// function(next) {
		// 	log('index')
		// 	this.db.ensureIndex({fieldName: 'txn'}, next)
		// }.bind(this)
	], done)
	

		
}

