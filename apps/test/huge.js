var matrix = []
var len = 10000
for(var r=0; r<len; r++) {
	console.log('row', r)
	matrix[r] = []
	for(var c=0; c<len; c++) {
		matrix[r][c] = c/(c+0.12341234)
	}	
}