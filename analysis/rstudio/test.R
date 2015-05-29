dat <- data.frame(
  time = factor(c("Lunch","Dinner"), levels=c("Lunch","Dinner")),
  total_bill = c(14.89, 17.23)
)
dat
#>     time total_bill
#> 1  Lunch      14.89
#> 2 Dinner      17.23

# Load the ggplot2 package
library(ggplot2)

# Very basic bar graph
ggplot(data=dat, aes(x=time, y=total_bill)) +
  geom_bar(stat="identity")