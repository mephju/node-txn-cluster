

var Datastore = require('nedb')
var Distance = require('./distance').Distance
 

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
	this.distanceMeasure = new Distance(dataset)
	this.db = new Datastore({ 
		filename: dataset.dbPath + '.distances',
		autoload: true
	});
}





exports.DistanceStore = DistanceStore

DistanceStore.prototype.get = function(txnRow, done) {
	process.stdout.write('.')
	var _this = this
	var txn = txnRow['item_ids'].toString()

	async.waterfall([
		function(next) {
			_this.db.findOne(
				{ _id:  txn.toString()}, 
				next
			);
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
	//log('inserting', doc)

	async.waterfall([
		function(next) {
			this.db.insert(doc, done)		
		}.bind(this),
		function(doc, next) {
			done()
		}
	], function(err) {
		log(err)
	})
	
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
				log('all distance maps created')
				next()
			}
		);	
	}


	async.waterfall([
		function(next) {
			this.db.remove({}, next)	
		}.bind(this),
		function(numRemoved, next) {
			this.db.removeIndex('txn', next)
		}.bind(this),
		function(next) {
			this.db.insert({txn:'1019834208sd134782374akjasldkfhsfdh8902'}, next)
		}.bind(this),
		function(doc, next) {
			next()
		}.bind(this),
		insertDistances.bind(this),
		function(next) {
			log('index')
			this.db.ensureIndex({fieldName: 'txn'}, next)
		}.bind(this)
	], done)
	

		
}
