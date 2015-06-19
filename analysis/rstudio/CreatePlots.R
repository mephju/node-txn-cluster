library(ggplot2)
library(plyr)

source('./lib.R')




# Create a plot of the evaluation results for
# the given datasetName. Compares precision of evaluation runs
# for varying distance measures and item choice strategies
CreateDistanceVsStrategyFrame <- function(kDatasetName) {
	
	eval <- read.csv(
		paste0('../', kDatasetName, '_more.csv'),
		header=TRUE
	)


	res <- data.frame(
		eval$distance,
		eval$xvalidation,
		eval$markov,
		eval$strategy,
		eval$precision
	)
	names(res) <- c('distance', 'xvalidation', 'markov', 'strategy', 'precision')

	res <- aggregate(
		res$precision,
		by=list(
			distance=eval$distance, 
			strategy=eval$strategy
		),
		FUN=mean
	)

	names(res)[names(res) == 'x'] <- 'precision'

	res$strategy = mapvalues(
		res$strategy, 
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', 'Most Frequent')
	)
	
	res$distance = mapvalues(
		res$distance, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)

	res <- res[order(-res$precision),]

	res$precision = round(res$precision, digits=4)

	methodCol <- paste(res$distance, '/', res$strategy)
	merged <- data.frame(
		methodCol, 
		res$precision
	)

	names(merged) <- c('method', 'precision')
	merged <- merged[order(-merged$precision),]
	
	return(merged)

}


# Create a plot of the evaluation results for
# the given datasetName. Compares precision of evaluation runs
# for varying distance measures and item choice strategies
CreateDistancePlot <- function(kDatasetName, kPathPrefix) {
	
	eval = read.csv(
		paste0('../', kDatasetName, '_more.csv'),
		header=TRUE
		)
	
	names(eval)[names(eval) == 'precision'] <- 'Precision'
	
	eval$Strategy = mapvalues(
		eval$strategy, 
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', 'Most Frequent')
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
	
	filename = paste0(kPathPrefix, kDatasetName, '-compare-distance-strategy.pdf', sep='')
	ggsave(filename, my.plot, width=5.8, height=5)
	
	return(my.plot)

}




CreateParamPlot <- function(dataset.name, kPathPrefix, groupByFrame) {
	
	eval = groupByFrame	
	names(eval)[names(eval) == 'precision'] <- 'Precision'
	
	eval$param = mapvalues(
		eval$param, 
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', '         Most Frequent')
	)
	
	eval$param = mapvalues(
		eval$param, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard Index', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)
	
	eval$param = mapvalues(
		eval$param, 
		from=c('1','2','3'), 
		to=c('1st Order', '               2nd Order', '3rd Order')
	)
	
	eval.distance = eval[1:4, ]
	eval.markov = eval[5:7, ]
	eval.strategy = eval[8:12, ]
	
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

	# filename = paste(kPathPrefix, dataset.name, '-param-distance-means.pdf', sep='')
	# ggsave(filename, plot.distance, width=5.8, height=5)
	# filename = paste(kPathPrefix, dataset.name, '-param-markov-means.pdf', sep='')
	# ggsave(filename, plot.markov, width=5.8, height=5)
	# filename = paste(kPathPrefix, dataset.name, '-param-strategy-means.pdf', sep='')
	# ggsave(filename, plot.strategy, width=5.8, height=5)
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









