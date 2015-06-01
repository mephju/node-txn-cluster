var Cluster = require('./cluster')

var should = require('should')


describe('Cluster', function() {
	it('buildSimMatrix() works', function() {
		var matrix = Cluster.buildSimMatrix(members, distanceMeasure)
		//console.log(matrix)

		var distanceSums = []
		for(var r=0; r<members.length; r++) { //r for row
			distanceSums[r] = Cluster.sumRow(matrix, r)
		}
		console.log(matrix)
		console.log(distanceSums)
	})



	it('sumRow() works', function() {
		var matrix = [
			[null,1,2,3], 			//0,1,2,3 = 6
			[null,null,5,10], 		//1,0,5,10 = 16
			[null,null,null,20], 	//2,5,0,20 = 27
			[null,null,null,null] 	//3,10,20,0 = 33
		];

		var sum1 = Cluster.sumRow(matrix, 0) 
		var sum2 = Cluster.sumRow(matrix, 1) 
		var sum3 = Cluster.sumRow(matrix, 2) 
		var sum4 = Cluster.sumRow(matrix, 3) 

		sum1.should.equal(6)
		sum2.should.equal(16)
		sum3.should.equal(27)
		sum4.should.equal(33)
	})
})

var members = [ 
  { txn_id: 866,
    item_ids: [ 597, 596, 595, 908, 907, 906, 1054, 1053, 1052, 1051, 1050 ] },
  { txn_id: 901,
    item_ids: [ 1189, 664, 663, 662, 661, 658, 1188, 1187, 1186, 1190, 940, 1188, 1187, 597, 596, 595, 908, 907, 1026, 1025, 1024, 1023, 1022, 1021, 1020, 1019, 1342, 1341, 1340, 1339, 1338, 1338, 1338, 1337, 1336 ] },
  { txn_id: 993,
    item_ids: [ 871, 1128, 1128, 1192, 482, 1192, 597, 582, 1131, 1117, 1128 ] },
  { txn_id: 892,
    item_ids: [ 597, 556, 555, 554, 553, 554, 553, 552, 392, 552, 392, 551, 551 ] },
  { txn_id: 891,
    item_ids: [ 597, 596, 595, 930, 929, 919, 928, 927, 926, 1054, 1053, 1052, 1053, 1051, 1052, 1051, 1050, 1049, 1048, 597, 596, 595, 908, 907, 908, 906, 907, 906, 1054, 1054, 597 ] }, 
  { txn_id: 870,
    item_ids: [ 597, 1392, 1391, 1352, 1353, 1390, 1389, 1388, 1387, 1386, 596, 595, 908, 907, 906, 1054, 1053, 1052, 1051, 1050, 1385, 556, 555, 554, 553 ] }, 
  { txn_id: 905, 
  	item_ids: [ 596 ] },
  { txn_id: 869,
    item_ids: [ 596, 595, 908, 907, 906, 1054, 1053, 1052, 1051, 1050 ] },
  { txn_id: 894, 
  	item_ids: [ 596, 595, 595 ] },
  { txn_id: 893, 
  	item_ids: [ 597, 597, 596 ] },
  { txn_id: 879,
    item_ids: [ 597, 615, 614, 613, 612, 611, 610, 609, 615 ] },
  { txn_id: 865,
    item_ids: [ 1049, 1048, 597, 596, 595, 908, 907 ] },
  { txn_id: 868,
    item_ids: [ 1049, 1048, 597, 596, 595, 908, 907, 906, 1054, 1053, 1052, 1051, 1050, 1049, 597, 596, 595, 597 ] },
  { txn_id: 881,
    item_ids: [ 597,596, 595, 908, 907, 906, 1054, 1053, 1052, 1051, 1050, 1049, 1048, 597, 596, 595, 908, 907 ] },
  { txn_id: 1120, 
  	item_ids: [ 630, 597, 596, 595, 908 ] },
  { txn_id: 899, 
  	item_ids: [ 597, 596, 595, 908 ] },
  { txn_id: 1073,
    item_ids: [ 597, 596, 597, 596, 595, 595, 908, 908, 907, 906, 907 ] },
  { txn_id: 945, 
  	item_ids: [ 596, 595, 908 ] },
  { txn_id: 947, 
  	item_ids: [ 597 ] },
  { txn_id: 924, 
  	item_ids: [ 597, 596, 595 ] } 
];


var distanceMeasure = {
	distance: function(seq1, seq2) {
		return 0.5
	}
}