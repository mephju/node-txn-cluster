a <- ggplot(data = msleep,     aes(x = log(bodywt), y = sleep_rem/sleep_total, col = vore))
a <- a + geom_point(size=5)
a <- a + xlab("Log Body Weight") + ylab("Fraction of Sleep that is REM") + ggtitle("Some Sleep Data") + 
  scale_color_discrete(name = "Trophic Level")
a = a + facet_grid(conservation~vore)
a


b = ggplot(data=movies, aes(x=strategy, y=precision)) + geom_bar(stat='identity') + facet_grid(distance~markov)

xaxis=c('Most Frequent', 'Most Popular', 'Random', 'TF-IDF', 'TF-TF-IDF', 'Best Rated')


movies$strat = mapvalues(movies$strategy, from=c('random', 'tfTfidf', 'tfidf', 'withRatings', 'bestItemsOverall', 'bestItemsOfCluster'), to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Best Rated', 'Most Popular', 'Most Frequent'))
b = ggplot(data=movies, aes(x=strat, y=precision, col=strat) ) 
+ geom_bar(stat='identity', col) 
+ facet_grid(~distance)

movies$dist = mapvalues(movies$distance, from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), to=c('Jaccard Index', 'Jaccard Bigram', 'Jaccard Levenshtein', 'Levenshtein'))

