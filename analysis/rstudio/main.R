source('./CreatePlots.R')
source('./CreateTopList.R')




CreateDatasetResult <- function() {
	topResults <- CreateTopList()
	chart <- CreateBarChart(topResults)
	print(topResults)
	print(chart)
}

CreateDatasetResult()