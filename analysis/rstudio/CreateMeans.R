

# Groups evaluation results by each param (distance, markov, strategy)
# and unites all resulting data frames into a single data frame.
CreateGroupByParamFrame <- function(kDatasetName) {
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

	res.distance.measure <- aggregate(
		eval$precision,
		by=list(param=eval$distance),
		FUN=mean
	)
	res.markov <- aggregate(
		eval$precision,
		by=list(param=eval$markov),
		FUN=mean
	)
	res.strategy <- aggregate(
		eval$precision,
		by=list(param=eval$strategy),
		FUN=mean
	)
	# Make sure param column of res.markov contains factors and not numbers.
	# Numbers are not handled well when binding the data frames together
	res.markov$param <- as.factor(res.markov$param) 
	res <- rbind(res.distance.measure, res.markov, res.strategy)
	
	names(res)[names(res) == 'x'] <- 'precision'
	
	return(res)
}



