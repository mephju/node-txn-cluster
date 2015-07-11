var sqlite3 	= require('sqlite3').verbose();
var db 			= null
var dbLastFm 	= require('./db-lastfm')
var sql 		= require('./sql')


var insertFeedbackStmt = null


exports.prepare = function(dataset, done) {
	
	console.log('preparing feedback tables', dataset.dbPath)

	async.series([
		function(next) {
			db = new sqlite3.Database(dataset.dbPath)
			db.serialize(next)
		},
		function(next) {
			if(dataset.name.indexOf('last') !== -1) {
				dbLastFm.init(db, next)	
			} 
			else {
				next(null)
			}
		},
		function(next) {
			db.run('drop table if exists feedback', next)
		},
		function(next) {
			console.log('createFeedbackStmt1')
			db.run(sql.createFeedbackStmt(), next)
		},
		function(next) {
			insertFeedbackStmt = db.prepare('INSERT INTO feedback VALUES(?, ?, ?, ?)', next)
		},
		function(next) {
			db.run('PRAGMA journal_mode = OFF', next)
		}
	], 
	function(err) {
		done(err)
	})
	
	
}









exports.insert = function(dataset, records, callback) {
	
	var table = dataset.name
	log('insert', records.length)
	

	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			if(table.indexOf('last_fm') !== -1) {
				return insertLastFm(dataset, records, next)
			} 
			if(table.indexOf('epinions') !== -1) {
				convertTimestamps(dataset, records)
			}
			else if(table.indexOf('gowalla') !== -1) {
				convertTimestamps(dataset, records)
			}
			insertItems(dataset, records, next)
		},
		function(next) {
			console.log('inserted')
			db.run('END TRANSACTION', next)	
		}
	],
	callback);
}


var convertTimestamps = function(dataset, records) {
	//year/month/day
	//2010-07-24T13:45:06Z
	
	records.forEach(function(record) {
		var date = record[dataset.indices.timestamp]
		record[dataset.indices.timestamp] = parseInt(
			new Date(record[dataset.indices.timestamp]).getTime()/1000
		);

	})
	
	// var myDate="26-02-2012";
	// myDate=myDate.split("-");
	// var newDate=myDate[1]+"/"+myDate[0]+"/"+myDate[2];
	// alert(new Date(newDate).getTime());


}


var insertItem = function(dataset, record, next) {
	//log(2, record[0], record[1])
	insertFeedbackStmt.run([ //user, item, timestamp, rating
		record[dataset.indices.userId], 
		record[dataset.indices.itemId], 
		record[dataset.indices.timestamp], 
		record[dataset.indices.rating]
	], next);
}
var insertItems = function(dataset, records, callback) {

	async.eachSeries(
		records,
		function(record, next) {
			insertItem(dataset, record, next)
		},
		function(err) {
			callback(err)
		}
	);
}

/**
 * Takes a last fm dataset record. Creates an item out
 * of artist and song and then inserts the record like 
 * any other dataset record.
 * 
 * @param  {[type]}   records  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var insertLastFm = function(dataset, records, done) {

	async.eachSeries(
		records,
		function(record, next) {
			//log(record[0],record[1],record[2],record[3],record[4],record[5])
			//log(record[0],record[1], record[3], '   -----  ',record[5])
			dbLastFm.makeLastFmItem(record, function(err, itemId) {
				if(err) { return next(err) }
					
				var rec = [ 
					record[dataset.indices.userId], 
					itemId, 
					null, 
					new Date(record[1]).getTime()/1000 
				]; 

				//log(1, rec[0], rec[1])
				insertItem(dataset, rec, next)
			})
		},
		function(err) {
			console.log('insertLastFm.finished', err)
			insertLastFmFeedback(dataset, records, done)
		}
	);
		
}


var insertLastFmFeedback = function(dataset, records, done) {
	async.eachSeries(
		records,
		function(rec, next) {
			db.run('INSERT INTO last_fm_feedback VALUES(?,?,?,?,?,?)', rec, next)
		},
		done
	);
}


exports.createFeedbackIdx = function(done) {
	log('createFeedbackIdx')
	var createIndex = 
	'create index 	user_id_on_feedback_index \
	on 				feedback(user_id asc)'
	db.run(createIndex, function(err) {
		log('index created', arguments)
		done()
	});
}


