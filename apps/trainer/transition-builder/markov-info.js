var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var rootDb 		= require('../db')
var config 		= require('../config')
var eachtick 	= require('eachtick')
var fs			= require('fs')
var transMarkovChain = require('./trans-markov-chain')

var N_GRAM_SIZE = config.MARKOV_ORDER + 1


var getInfo = function(done) {
	async.waterfall([
		function(next) {
			transMarkovChain.getMarkovChain(next)
		},
		function(markovChain, next) {
			var markovInfo = new MarkovInfo(markovChain)
			done(null, markovInfo)
		}
	], done)
}



function MarkovInfo(markovChain) {
	computeMcSums(markovChain)
	this.info = markovChain
}


/**
 * get N cluster ids with highest values
 * @param  {[type]} N            [description]
 * @param  {[type]} lastClusters [description]
 * @return {[type]}              [description]
 */
MarkovInfo.prototype.getTopClusters = function(N, lastClusters) {
	var topClusters 	= []
	var partChain 		= this.info

	for (var i = 0; i < lastClusters.length; i++) {
		if(partChain) {
			var clusterId = lastClusters[i]
			partChain = partChain[clusterId]
		} else {
			return []
		}
	};

	var useSum = lastClusters.length < config.MARKOV_ORDER

	for(var key in partChain) {
		if(key !== 'sum') {
			var value = partChain[key]
			var candidate = {
				idx:key,
				sum: isNaN(value) ? value.sum : value
			}
			addTopCluster(candidate, N, topClusters)
		}
			
	}

	return topClusters
}


/**
 * 
 * @param {[type]} candidate   [description]
 * @param {[type]} MAX         [description]
 * @param {[type]} topClusters [description]
 */
var addTopCluster = function(candidate, MAX, topClusters) {
	if(topClusters.length < MAX) {
		return topClusters.push(candidate)
	} 

	for(var i=0; i<topClusters.length; i++) {
		var topKeyVal = topClusters[i]

		if(candidate.sum > topKeyVal.sum) {
			var minIdx = getMinIdx(topClusters)
			topClusters[minIdx] = candidate
			return
		}
	}
}


var getMinIdx = function(topClusters) {
	var min = {
		sum : Number.MAX_VALUE,
		idx: -1
	}

	for(var i=0; i<topClusters.length; i++) { 
		var entry = topClusters[i]
		if(entry.sum < min.sum) {
			min.sum = entry.sum
			min.idx = i
		}
	}

	return min.idx
}









var computeMcSums = function(value) {

	var sum = 0
	for(var key in value) {
		var subvalue = value[key]
		if(isNaN(subvalue)) {
			sum += computeMcSums(subvalue)
		} else {
			sum += subvalue
			//delete value[key]
		}
	}
	value.sum = sum

	return sum
}

var isObject = function(value) {
	return typeof value === 'object'
}




exports.MarkovInfo = MarkovInfo
exports.getInfo = getInfo
exports.test = {
	MarkovInfo: MarkovInfo,
	getInfo: getInfo,
	computeMcSums: computeMcSums,
	getMinIdx: getMinIdx,
	addTopCluster: addTopCluster
}




// var markovInfo = new MarkovInfo(example)
// console.log(markovInfo.info)