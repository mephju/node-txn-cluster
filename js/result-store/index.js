var async 		= require('async')
var _			= require('lodash')
var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.resultDbPath())

var config 		= require('../config')



var storeResult = function(precision, done) {

	var store = {
		keyString: '',
		values:[]
	}
	addKeyVals(dataset, store)
	addKeyVals(config, store)
	store.keyString += 'extra, json, comment, precision, created_at, timestamp'
	store.values.push('-')
	store.values.push('-')
	store.values.push('-')
	store.values.push(precision)
	store.values.push(new Date().toLocaleString())
	store.values.push(new Date().getTime())
		
	async.waterfall([
		function(next) {

			db.run(
				'create table if not exists results(' 
					+ store.keyString
					+ ')', 
				next
			);
		},
		function(next) {
			var questionMarks = store.values.map(function(item) { 
				return '?'
			})
			
			db.run(
				'insert into results(' + store.keyString + ') VALUES(' + questionMarks.toString() + ')',
				store.values,
				next
			);
		}
	], done)
}


var addKeyVals = function(object, store) {
	var keys = Object.keys(object)
	
	var values = keys.forEach(function(key) {
		var val = object[key]
		
		if(typeof val === 'object' || key === 'init') {
			if(key === 'ITEM_CHOICE_STRATEGY') {
				store.values.push(JSON.stringify(val))
			} else {
				store.values.push('-')			
			}
		} else {
			store.values.push(val)	
		}
		
	})

	keys = keys.map(function(key) {
		return key.toLowerCase() + ','
	}).reduce(function(le, ri) {
		return le + ri
	})
	store.keyString  += keys
	return store
}

//storeResult(0.5)

exports.storeResult = storeResult