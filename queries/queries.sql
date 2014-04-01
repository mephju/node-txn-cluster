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



