var Parallel = require('paralleljs')



exports.genCandidates = function(store, k, useCores, done) {
	log.yellow('genCandidates')

	var candidates = []
	
	var keys = Object.keys(store[k-1]) //all keys of level k-1
	var frequent = keys.map(function(key) {
		return help.textToNumArray(key)
	})

	var sliceLen = Math.ceil(frequent.length / useCores)

	for (var i = 0, j = 0; i < useCores; i++) {
		
		new Parallel({
			frequent: frequent,
			sliceIdx: 0,
			sliceLen: sliceLen,
			k: k,
		})
		.require(contains, mergeSets, areSetsIn, mergeInto, makeSubsets)
		.spawn(genCandidatesFromSlice)
		.then(function(res) {
			log.yellow('candidates finished')
			j++
			res.forEach(function(c) {
				if(!contains(candidates, c)) { 
					candidates.push(c)
				}
			})
			if(j === i) { 
				return done(null, candidates) 
			}
		})
	};

}



var genCandidatesFromSlice = function(data) {

	console.log('candidates')

	var k 			= data.k
	var frequent 	= data.frequent
	var sliceIdx	= data.sliceIdx
	var sliceLen 	= data.sliceLen
	var len 		= frequent.length
	var candidates 	= []
	var idx 		= sliceIdx * sliceLen
	var len 		= idx + sliceLen



	for(var i=idx; i<len; i++) {
		
		console.log(i-idx, 'of', sliceLen)

		for(var h=i+1; h<len; h++) {
			
			var c = mergeSets(frequent[i], frequent[h])
			
			if(c.length === k && !contains(candidates,c)) { 
				var subsets = makeSubsets(c, k-1)
				if(areSetsIn(subsets, frequent)) {
					candidates.push(c)
				}
			}
		}
	}

	return candidates
}


function contains(array, element) {
	for (var i = 0; i < array.length; i++) {
		if(array[i].toString() === element.toString()) {
			return true
		}
	};
	return false
}

function mergeSets(set1, set2) {
	
	var newSet = set1.slice()
	for(var i=0,len=set2.length; i<len; i++) {
		mergeInto(newSet, set2[i])
	}
	
	return newSet
}


//Find position in 'set' where new value should be inserted
function mergeInto(set, value) {
	for(var i=0,len=set.length; i<len; i++) {
		if(value === set[i]) {
			return
		} 
		if(set[i] > value) {
			// at position i do not remove any elements but insert 'value'
			return set.splice(i, 0, value) 
		}
	}
	set.push(value)	
	return set.length
}

function makeSubsets(itemset, size) {
	var subsets = []
	for(var i=0; i+size<=itemset.length; i++) {
		subsets.push(itemset.slice(i, i+size))
	}
	return subsets
}


function areSetsIn(sets, frequentSets) {
	for(var i=0; i<sets.length; i++) {
		if(!contains(frequentSets, sets[i])) { return false }
	}
	return true
}



	
