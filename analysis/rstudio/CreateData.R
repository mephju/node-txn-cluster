library(plyr)

source('./lib.R')




# Create a plot of the evaluation results for
# the given datasetName. Compares precision of evaluation runs
# for varying distance measures and item choice strategies
CreateDistanceVsStrategyFrame <- function(kDatasetName) {
	eval <- read.csv(
		paste0('../', kDatasetName, '_more.csv'),
		header=TRUE,
		strip.white=TRUE
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
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster', 'withRatings'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', 'Most Frequent', 'Best Rated')
	)
	
	res$distance = mapvalues(
		res$distance, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)

	res <- res[order(-res$precision),]

	#res$precision = round(res$precision, digits=4)

	methodCol <- paste(res$distance, '/', res$strategy)
	merged <- data.frame(
		methodCol, 
		res$precision
	)

	names(merged) <- c('method', 'precision')
	merged <- merged[order(-merged$precision),]
	
	return(merged)

}
