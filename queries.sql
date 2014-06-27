
--  gcc -fPIC -shared extension-functions.c -o extension-functions.so -lm
select load_extension('/home/mephju/maproject/daport/sqlite/extension-functions');
drop table if exists cluster_item_tfidf;
create table cluster_item_tfidf
as 
select 		cic.cluster_id,
			cic.item_id,
			cic.count 				as tf,
			icc.count 				as df,
			cc.N, 			
			cic.count*log10(cc.N/icc.count)	as tfidf
              
from 		cluster_item_counts 	as cic,
			item_cluster_counts 	as icc,
			item_counts 			as ic,
			(select 	count(*) 	as N 
			from 		clusters)   as cc

where 	cic.item_id=icc.item_id
and 	icc.item_id=ic.item_id;





-- how many clusters contain item_id
create table 	item_cluster_counts
as
select   		item_id, 
				count(cluster_id) as count

from 			cluster_item_counts
group by 		item_id
order by 		item_id, cluster_id








create table cluster_item_txn
as select 	cic.item_id,
			cic.count,
			cic.cluster_id,
			cm.txn_id
			

from 		cluster_item_counts as cic,
			cluster_members as cm

where 		cic.cluster_id=cm.cluster_id
and 		cm.txn_id 
in (

select 		txn_id 
from 		txn_items
where 		item_id=cic.item_id
);








create table 	txn_item_ratings
as
select 			ti.txn_id, 
				ti.item_id, 
				f.rating
from 			txn_items as ti, 
				feedback as f, 
				txns as t
where 			ti.txn_id=t.txn_id
and 			t.user_id=f.user_id
and 			ti.item_id=f.item_id; 









create table cluster_item_ratings
as select 	cic.item_id,
			cic.count,
			cic.cluster_id,
			cm.txn_id,
			tir.rating

from 		cluster_item_counts as cic,
			cluster_members as cm,
			txn_item_ratings as tir

where 		cic.cluster_id=cm.cluster_id
and 		tir.txn_id=cm.txn_id
and         tir.item_id=cic.item_id










select *,sum(count)
from cluster_item_counts
where cluster_id=0


select 		cic.item_id,
			cic.count,
			cic.cluster_id,
			cm.txn_id,
			txns.user_id,
			f.rating
from 		cluster_item_counts as cic,
			cluster_members as cm,
			txn_items as ti
where 		cic.cluster_id=0
and 		cic.item_id=6
and 		cic.cluster_id=cm.cluster_id
and 		cic.txn_id=ti.txn_id
and 		ti.item_id=cic_item_id




-- get avg rating of item_id in a cluster
select 		cic.item_id,
			cic.count,
			cic.cluster_id,
			cm.txn_id,
			txns.user_id,
			f.rating

from 		cluster_item_counts as cic,
			cluster_members as cm,
			txns,
			feedback as f,
			txn_items

where 		cic.cluster_id=0
and 		cic.cluster_id=cm.cluster_id
and 		cm.txn_id=txns.txn_id
and 		txn_items.txn_id=cm.txn_id
and         txn_items.item_id=cic.item_id
and 		txns.user_id=f.user_id
and 		f.item_id=cic.item_id


select 		txn_id
from 		cluster_members
where 		cluster_id=0
and  		item_id=



drop table if exists item_counts;
create table item_counts 
as
select 		item_id, count(item_id) as count
from 		txn_items 
where 		txn_id 
in
(select 	txn_id 
from 		txns 
order by 	txn_id
limit 		48573)
group by 	item_id
order by 	count desc;

-- retrieve most popular items of the traning set
-- 1. get txn_ids of training set
-- 2. get item_ids of those txn_ids
-- 3. group by item_id and count them
select item_id, count(item_id) as count
from txn_items 
where txn_id 
in
(select txn_id 
from txns 
order by txn_id
limit 21316)
group by item_id
order by count desc


-- delete those clusters that have less than 4 txns assigned to them
delete from 	clusters 
where 			cluster_id
in 		 		(select 	cluster_id
				from 		(select 	*, count(txn_id) as count 
							from 		cluster_members 
							group by 	cluster_id)
				where 		count<4)




create table 	cluster_item_counts
as
select 			cluster_id, 
				item_id, 
				count(item_id) as count
from 			txn_items as ti,
				(select 		cluster_id, txn_id 					
				from 			cluster_members				
				union 										
				select  		centroid_txn_id as txn_id,
								cluster_id 	
				from 			clusters) as uni 		
where 			ti.txn_id=uni.txn_id
group by 		cluster_id, item_id
order by 		cluster_id, count desc





select 			cluster_id, 
				item_id, 
				count(item_id) as count
from 			txn_items as ti,
				(select 		cluster_id, txn_id 					
				from 			cluster_members				
				where 			cluster_id=1				
				union 										
				select  		centroid_txn_id as txn_id,
								cluster_id 	
				from 			clusters 					
				where 			cluster_id=1) as uni 		
where 			ti.txn_id=uni.txn_id
group by 		item_id
order by 		cluster_id, count desc






select 		*, count(ti.item_id) as count
from 		cluster_members as cm,
			txn_items as ti
where 		cm.txn_id=ti.txn_id
group by 	cm.cluster_id, ti.item_id
order by 	cluster_id, count





select 	*
from 	cluster_members as cm, 
		txn_items as ti
where 	cm.txn_id=ti.txn_id
and 	cm.cluster_id=0




select distinct
			ic.item_id, ic.count
from 		cluster_members as cm, 
			txn_items as ti, 
			item_counts as ic
where 		cm.txn_id=ti.txn_id
and 		ti.item_id=ic.item_id
and 		cm.cluster_id=1
order by 	ic.count desc


select * 
from item_counts
where item_id 
in (
	select item_ids 
	from cluster_members
	where rowid=1
)



select 	item_id, count(item_id) as count 
from 	txn_items 
where 	item_id 
in (
		select 	item_id 
		from 	cluster_members 
		where 	cluster_id=0
)
group by item_id 
order by count DESC;



-- 1
create table 	item_counts
as 	select 		item_id, count(item_id) as count 
	from 		txn_items 
	group by 	item_id 
	order by 	count DESC;

-- 2
create index 	item_counts_index
on 				item_counts(item_id ASC);




select distinct item_id, count
from 			cluster_members as cm, item_counts as ic
where 			cluster_id=0
and 			cm.item_id = ic.item_id
order by 		count DESC;







select cluster_id, count(cluster_id) from clusters
natural join cluster_members
group by cluster_id;




DELETE FROM clusters 
WHERE 		cluster_id IN(
			SELECT 	cmid 
			as 		cluster_id 
			FROM(
					SELECT distinct  	cm.cluster_id as cmid, t.cluster_id as tid
					from 				clusters as cm  
					LEFT OUTER JOIN 	transition as t 
					ON 					cm.cluster_id=t.cluster_id
					WHERE 				tid is null
			)
);

SELECT 		count(*), * FROM txns, txn_items 
WHERE 		txn_items.txn_id=txns.txn_id
GROUP BY 	user_id;

SELECT count(*), * 
FROM txns
GROUP BY user_id;



CREATE VIEW IF NOT EXISTS cluster_items AS 
	SELECT 			cluster_id, item_id, count
	FROM 			cluster 
	NATURAL JOIN 	txn_items
	NATURAL JOIN(   SELECT 		item_id, count(*) 
					AS 			count
					FROM 		feedback
					GROUP BY 	item_id
					ORDER BY 	count DESC)
	ORDER BY  		cluster_id ASC,
					count DESC;



-- Create a view of txns where all item ids of a txn
-- are aggrefated into one cell
CREATE VIEW txn_item_groups AS
	SELECT 		txn_id, group_concat(item_id) 
	AS  		item_ids
	FROM 		txn_items
	GROUP BY 	txn_id
	ORDER BY 	rowid;


-- get 10 most popular items in the training set

SELECT 	 		item_id 
	FROM(
	SELECT 		count(*) 
	AS 			count, 
				item_id 
	FROM 		txn_items 
	WHERE 		txn_id 
	IN(
		SELECT 	txn_id 
		FROM 	txns 
		LIMIT 	1000
	)
	GROUP BY 	item_id 
	ORDER BY 	count 
	DESC
	LIMIT 		10
);

-- get 4 random items of cluster 0 and 8 random items of cluster 1

SELECT *
FROM(
	SELECT 			item_id 
	FROM 			cluster 
	NATURAL JOIN 	txn_items 
	WHERE 			cluster_id=0 
	ORDER BY 		random() 
	LIMIT 4
)
UNION ALL
SELECT *
FROM(
	SELECT 			item_id
	FROM 			cluster 
	NATURAL JOIN 	txn_items 
	WHERE 			cluster_id=1 
	ORDER BY 		random() 
	LIMIT 8
);






-- Get frequent sequence_ids of a particular txn_id
SELECT 			frequent.sequence_id, a.sequence_id
FROM			last_fm_frequent_sequence_ids AS frequent
LEFT OUTER JOIN	last_fm_txn_sequences AS a
ON				frequent.sequence_id = a.sequence_id
WHERE 			a.txn_id = 9185	
ORDER BY 		frequent.sequence_id;


-- Get all frequent sequence_ids
SELECT 		rowid as sequence_id
FROM 		last_fm_small_sequences 
WHERE 		count>10
ORDER BY    sequence_id;





-- Create index on last_fm_txn_sequences.sequence_id
CREATE INDEX 	"index_last_fm_txn_sequences_sequence_id" 
ON 				"last_fm_txn_sequences" ("sequence_id" ASC);


-- Create index on last_fm_txn_sequences.txn_id
CREATE INDEX 	"index_last_fm_txn_sequences_txn_id" 
ON 				"last_fm_txn_sequences" ("txn_id" ASC);

-- create a view with all the frequent sequence ids
CREATE VIEW IF NOT EXISTS last_fm_frequent_sequences
AS
SELECT 		rowid as sequence_id, sequence, count
FROM 		last_fm_sequences 
WHERE 		count>9
ORDER BY    sequence_id;




-- get all txn ids to the left 
-- with all their frequent sequene ids to the right
select 				t.txn_id, f.rowid, f.sequence, f.count
from 				last_fm_txn_sequences 
as t
left outer join( 	
					SELECT 		*,rowid
					FROM 		last_fm_sequences 
					WHERE 		count>3
					ORDER BY    rowid)  
as f
on 					t.sequence_id=f.rowid;




-- get all txn ids which contain frequent sequences
select distinct 	txn_id
from 				last_fm_sequences as f, 
					last_fm_txn_sequences as t
where 				count>1
and 				f.rowid=t.sequence_id;





select 				*
from 				last_fm_frequent_sequence_ids 
as 					frequent,
					last_fm_txn_sequences 
as 					txn
where 				frequent.sequence_id = txn.sequence_id
and 				txn.txn_id=758805;




-- Get a vector of sequence ids for a particular txn.
-- For every frequent sequence id contained in the txn
-- the cell will contain the sequence id
select distinct		*, txn.sequence_id as vector
from 				last_fm_frequent_sequences 
as 					frequent
left outer join (
		select distinct 	* 
		from 				last_fm_txn_sequences 
		where 				txn_id=758805
		order by 			sequence_id) 
as 		txn
on 		frequent.sequence_id = txn.sequence_id;












select distinct  txn_id 
from (
	SELECT * 
	from last_fm_small_txn_sequences 
	as a, last_fm_small_sequences as b 
	where a.sequence_id = b.rowid 
	AND count>=0 
	order by txn_id
);






SELECT 		txn_id, count(txn_id) as c 
FROM 		last_fm_small_txn_items 
GROUP BY 	txn_id 
HAVING 		c>=4;


INSERT OR IGNORE INTO 	movielens_custom_sequences(sequence, count) VALUES('1', 0);

UPDATE movielens_custom_sequences SET count = count+1 where sequence='1';









CREATE TABLE IF NOT EXISTS last_fm_txns (
	txn_id		INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id		TEXT NOT NULL)



SELECT * FROM last_fm ORDER BY user_id ASC, timestamp ASC;

SELECT *,count(*) as numitems from movielens_10m_txn_items GROUP by txn_id ORDER BY numitems DESC;

CREATE INDEX IF NOT EXISTS 		movielens_10m_txn_items_idx 
ON								movielens_10m_txn_items(item_id);

SELECT 		* 
FROM 		movielens_10m_txn_items
WHERE		item_id=1;



-- count number of txns containing item_id 588 and 231
-- this is basically the support for the itemset (588, 231)
SELECT 		COUNT(*)
FROM(
			SELECT 		txn_id, count(txn_id) AS c
			FROM 		movielens_10m_txn_items
			WHERE 		item_id IN (329,316)
			GROUP BY 	txn_id
			HAVING 		c = 2
			ORDER BY 	txn_id);




-- get counts for each txn
select 		txn_id, count(*) 
from 		last_fm_txn_items 
group by 	txn_id 
order by 	count(*);



