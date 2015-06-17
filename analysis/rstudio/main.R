source('./CreateBarChart.R')
source('./CreatePlots.R')
source('./CreateTopList.R')
source('./CreateMeans.R')




# Create 3 charts
# 1. Compare best results of own method against 2 baselines in a bar chart.
# 	 Needs 2 files: dataset_baseline_more.csv, dataset_more.csv
# 	
# 2. Create a bar chart for each parameter (distance measure, markov order, item choice strategy)
# 	 These charts show how much impact the param has on the results.
# 	 
# 3. Create bar for each combination of distance measure and item choice strategy.
# 	 This chart visualizes the complete results. The reason we can neglect markov order param
# 	 is because it does not have too much impact on the results.

CreateDatasetResult <- function() {
	kDatasetName 	<- 'lastfm' #'movielens'
	kPathPrefix 	<- '/home/mephju/maproject/thesis/template/Figures/'

	topResults <- CreateTopList(kDatasetName)
	chart <- CreateBarChart(topResults, kPathPrefix, kDatasetName)
	print(topResults)
	print(chart)

	CreateMeans(kDatasetName, kPathPrefix)
	groupByFrame <- CreateGroupByParamFrame(kDatasetName, kPathPrefix)
	print(groupByFrame)
	CreateParamPlot(kDatasetName, kPathPrefix, groupByFrame)
	CreateDistancePlot(kDatasetName, kPathPrefix)
}

CreateDatasetResult()


	