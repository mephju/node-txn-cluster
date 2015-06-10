library(ggplot2)
library(plyr)

source('./lib.R')

kPathPrefix = '/home/mephju/maproject/thesis/template/Figures/'

# Create a plot of the evaluation results for
# the given datasetName. Compares precision of evaluation runs
# for varying distance measures and item choice strategies
CreateDistancePlot <- function(datasetName) {
	
	eval = read.csv(
		'../movielens_more.csv', 
		header=TRUE
	)
	
	names(eval)[names(eval) == 'precision'] <- 'Precision'
	mapvalues(c('a'), from=c('a'), to=('b'))
	
	eval$Strategy = mapvalues(
		eval$strategy, 
		from=c('random', 'tfTfidf', 'tfidf', 'withRatings', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Best Rated', 'Most Popular', 'Most Frequent')
	)
	
	eval$Distance = mapvalues(
		eval$distance, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard Index', 'Jaccard Bigram', 'Jaccard Levenshtein', 'Levenshtein')
	)
	
	my.plot = ggplot(
		data=eval, 
		aes(x=Strategy, y=Precision)
	) + 
		geom_bar(stat="identity") +
		facet_wrap(~Distance) +
		theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
		scale_x_discrete(name="Distance Measure") +
		scale_y_continuous(name="Precision") +
		theme(
			legend.position="none",
			axis.title.x = element_text(colour='#858585'),
			axis.title.y = element_text(colour='#858585')
		)
	
	filename = paste(kPathPrefix, datasetName, '-compare-distance-strategy.pdf', sep='')
	ggsave(filename, my.plot, width=5.8, height=5)
	
	return(my.plot)

}




CreateParamPlot <- function(dataset.name) {
	eval = read.csv('../param_means.csv', header=TRUE)
	
	names(eval)[names(eval) == 'precision'] <- 'Precision'
	
	eval$param = mapvalues(
		eval$param, 
		from=c('random', 'tfTfidf', 'tfidf', 'withRatings', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Best Rated', 'Most Popular', '         Most Frequent')
	)
	
	eval$param = mapvalues(
		eval$param, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard Index', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)
	
	eval$param = mapvalues(
		eval$param, 
		from=c(1,2,3), 
		to=c('1st Order', '               2nd Order', '3rd Order')
	)
	
	eval.distance = eval[1:4, ]
	eval.strategy = eval[5:10, ]
	eval.markov = eval[11:13, ]
	
	names(eval.distance)[names(eval.distance) == 'param'] <- 'Distance'
	names(eval.strategy)[names(eval.strategy) == 'param'] <- 'Strategy'
	names(eval.markov)[names(eval.markov) == 'param'] <- 'Order'
		
	plot.distance <- buildParamPlot(
		eval.distance$Distance,
		eval.distance$Precision,
		'Distance Measure\n',
		'Precision'
	)
	
	plot.strategy <- buildParamPlot(
		eval.strategy$Strategy,
		eval.strategy$Precision,
		'Item Choice\nStrategy',
		'Precision'
	)
	
	plot.markov = buildParamPlot(
		eval.markov$Order,
		eval.markov$Precision,
		'Order of\nMarkov Chain',
		'Precision'
	)
 
	filename = paste(kPathPrefix, dataset.name, '-param-means.pdf', sep='')
	pdf(filename, width=5.8, height=4)
	multiplot(plot.distance,  plot.markov, plot.strategy, cols=3)
	dev.off()

	filename = paste(kPathPrefix, dataset.name, '-param-distance-means.pdf', sep='')
	ggsave(filename, plot.distance, width=5.8, height=5)
	filename = paste(kPathPrefix, dataset.name, '-param-markov-means.pdf', sep='')
	ggsave(filename, plot.markov, width=5.8, height=5)
	filename = paste(kPathPrefix, dataset.name, '-param-strategy-means.pdf', sep='')
	ggsave(filename, plot.strategy, width=5.8, height=5)
}


# 
buildParamPlot <- function(xdata, ydata, xtitle, ytitle) {
	data <- data.frame(xdata, ydata)
	param.plot <- ggplot(
		data=data, 
		aes(x=xdata, y=ydata)
	)  
	param.plot <- param.plot + geom_bar(stat="identity") +
		theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
		scale_x_discrete(name=xtitle) +
		scale_y_continuous(ytitle, breaks=seq(0,1,0.004)) +
		theme(
			legend.position="none",
			axis.title.x = element_text(colour='#858585'),
			axis.title.y = element_text(colour='#858585')
			#plot.margin = unit(c(2, 2, 2, 2), "inches")
		) +
		expand_limits(y=c(0,0.021))
}



CreateBarChart <- function(data) {
	bar.chart = ggplot(
		data=data, 
		aes(reorder(method, precision), y=precision)
	) + 
	geom_bar(
		stat="identity"
	) +
	scale_x_discrete(name='Method') +
	scale_y_continuous('Precision') +
	theme(
		legend.position="none",
		axis.title.x = element_text(colour='#858585'),
		axis.title.y = element_text(colour='#858585')
		#plot.margin = unit(c(2, 2, 2, 2), "inches")
	) +
	coord_flip() 

	filename = paste(kPathPrefix, 'movielens-results.pdf', sep='')
	ggsave(filename, bar.chart, width=5.8, height=4.5)
}


cp = CreateParamPlot('movielens')
bp = CreateDistancePlot('movielens')




