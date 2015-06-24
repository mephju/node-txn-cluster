

CreateTable <- function(kDatasetName) {
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
			markov=eval$markov, 
			strategy=eval$strategy
		),
		FUN=mean
	)

	

	names(res)[names(res) == 'x'] <- 'precision'

	res <- res[order(res$distance),]

	res$precision = round(res$precision, digits=4)

	

	strategies = c(
		'tfidf', 
		'tfTfidf', 
		#'withRatings', 
		'bestItemsOverall', 
		'bestItemsOfCluster', 
		'random'
	)



	for(strategy in strategies) {
		assign(
			paste0('subframes.', strategy), 
			MakeSubFrame(res, strategy)
		)
	}

	res <- merge(subframes.tfidf, subframes.tfTfidf)
	res <- merge(res, subframes.random)
	res <- merge(res, subframes.bestItemsOfCluster)
	res <- merge(res, subframes.bestItemsOverall)
	# res <- merge(res, subframes.withRatings)
	# res <- data.frame(res$distance, res$markov)


	for(y in 1:nrow(res)) {
		
		cat(paste(
			sep=' ',
			res[y,]$distance, '&',
			res[y,]$markov, '&',
			'\\cy', res[y,]$tfidf, '&',
			'\\cy', res[y,]$tfTfidf, '&',
			'\\cy', res[y,]$random, '&',
			'\\cy', res[y,]$bestItemsOfCluster, '&',
			'\\cy', res[y,]$bestItemsOverall,
			'\\\\ \\hline\n'
		))
		
	}

	return(res)
} 


# Takes a frame's values which are equal to colname
# and creates a new column based on these values 
MakeSubFrame <- function(frame, colname) {
	subframe = frame[frame$strategy == colname,]
	
	names(subframe)[names(subframe) == 'precision'] <- colname
	subframe <- subframe[-3]
	return(subframe)
}