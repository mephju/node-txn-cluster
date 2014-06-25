var assert = require('assert')
var centroidCollection = require('../../clustering/kmeans-centroid-collection')
var kmCentroid = require('../../clustering/kmeans-centroid')
var Centroid = kmCentroid.Centroid



describe('CentroidCollection', function() {
	it('adf', function(done) {
		centroidCollection.buildFromDb(function(err, collection) {
			console.log('received centroid collections', collection.centroids.length)
			//console.log('received centroid collections', collection.centroids[0])

			// var match = collection.findBestMatch([1058, 1057])
			// console.log(match.id)

			collection.centroids[0].featureVector.forEach(function(txn) {
				var match = collection.findBestMatch(txn)	
				
				console.log('cool', match.id)		
				
			})
				

			done(err)
		})
	})
})