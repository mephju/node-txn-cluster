SELECT 'distance group',  distance, avg(precision1) as p1, avg(precision2) as p2, avg(precision3) as p3
FROM movielens_1M 
group by distance

UNION ALL
SELECT  'markovorder group', markovorder,  avg(precision1) as p1, avg(precision2) as p2, avg(precision3) as p3 
FROM movielens_1M 
group by markovorder

UNION ALL

SELECT  'strategy group', strategy, avg(precision1) as p1, avg(precision2) as p2, avg(precision3) as p3 
FROM movielens_1M 
group by strategy;


--select * from mean;

--select markov, strategy, distance, precision, avg(precision)
--from movielens_more
--group by markov, strategy, distance;

create table means as
select distance,markov, strategy, avg(precision) as precision
from movielens_more
group by distance, markov, strategy
order by distance, markov, strategy;


select distance, avg(precision) as precision
group by distance
from means;



-- Collect precision averages of all parameters so you can
-- compare the averages of one parameter value to the other parameter value.
-- This gives you an idea about how much impact this value 
-- and by extension this parameter has on the result
select distance,avg(precision) as precision
from means
group by distance

union all

select strategy, avg(precision) as precision
from means
group by strategy

union all 

select markov, avg(precision) as precision
from means
group by markov;