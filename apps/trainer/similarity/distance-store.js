

function DistanceStore(dataset, distanceMeasure) {
	this.dataset = dataset
	this.distanceMeasure = distanceMeasure
	this.EASY_SEQUENCE_SIZE = this.dataset.config.EASY_SEQUENCE_SIZE
	this.keyCount = 0
	this.simStore = {}

}

module.exports = DistanceStore

DistanceStore.prototype.distance = function(seq1, seq2) {

	if(!(seq1.length > this.EASY_SEQUENCE_SIZE && seq2.length > this.EASY_SEQUENCE_SIZE) || this.keyCount > 5000) {
		return this.distanceMeasure.distanceAlgo(seq1, seq2)
	}


	//console.log('slow op ahead')
	var key1 = seq1.toString()
	var key2 = seq2.toString()

	var substore1 = this.simStore[key1] 
	var substore2 = this.simStore[key2]
	
	if(typeof(substore1) === 'undefined') {
		//console.log('create substore1')
		substore1 = {}
		this.simStore[key1] = substore1
	}
	if(typeof(substore2) === 'undefined') {
		//console.log('create substore2')
		substore2 = {}
		this.simStore[key2] = substore2
	}

	var similarity = substore1[key2]
	
	if(typeof(similarity) === 'undefined') {
		//console.log('calculate similarity')
		similarity = this.distanceMeasure.distance(seq1, seq2)
		substore1[key2] = similarity
		substore2[key1] = similarity
	}
	
	return similarity
}
