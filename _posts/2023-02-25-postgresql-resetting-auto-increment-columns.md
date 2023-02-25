---
layout: post
title:  "PostgreSQL - Resetting Auto-Increment Sequence"
date:   2023-02-25 00:00:00 +0000
categories: PostgreSQL SQL Sequence 
---

A short time ago, in a project that I worked on, we migrated the project from SQL Server to PostgreSQL. During this process, we faced a couple of problems. 

The first one was enforcing the case-insensitive and accent-insensitive behavior to the PostgreSQL database. This was pretty challenging (but I think it should not supposed to be), because PostgreSQL doesn't support it out of the box. 

> We use EF Core's PostgreSQL provider (Npgsql) and [in this document](https://www.npgsql.org/efcore/misc/collations-and-case-sensitivity.html?tabs=data-annotations), they explain this situation in more detail.

You either need to use a [collation](https://www.postgresql.org/docs/current/collation.html#:~:text=A%20collation%20is%20an%20SQL,library%20supplies%20the%20locale%20data.) to support case insensitivity or change the text types to [*citext*](https://www.postgresql.org/docs/current/citext.html) type for all database table types. In our project, we chose the *citext* option and converted our text types into *citext* types to allow case and accent insensitivity for those columns. Because, if we use **collations** it raises some problems for some operators such as [SQL LIKE Operator (`LIKE %a`)](https://www.w3schools.com/sql/sql_like.asp) and it breaks the query. To prevent this kind of problems, the *citext* option is suited better for us.

Also, we faced some other problems along the way but I will not talk about every problem in this article. Instead, I will only highlight a specific one: "resetting auto-increment columns". Firstly, I will describe the problem and then show you how to fix it.

## Problem

The problem was when we migrated our data to the new PostgreSQL database, some auto-incremented column values are being out-of-sequence, which means when we want to add a new record to a database table, it does not increment the related column by ***last_column_seq_value + 1*** formule, because the *last_column_seq_value* was not correct.

We noticed this problem when tried adding a new record to a certain table and see an error message in our application log as follows:

```text
[14:15:09 ERR] An error occurred while saving the entity changes. See the inner exception for details.
Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
 ---> Npgsql.PostgresException (0x80004005): 23505: duplicate key value violates unique constraint "PK_MyTable"
 ...
```

When we examined the log, we got the related error message from the log as follows:

```text
duplicate key value violates unique constraint "PK_MyTable"
```

Then, we started researching the problem and we found a [StackOverflow question](https://stackoverflow.com/questions/4448340/postgresql-duplicate-key-violates-unique-constraint) related to this problem. Almost all of the answers to this question indicate this is related to an auto-increment column being out-of-sync. Therefore, we first needed to check if the auto-increment columns are out-of-sync and fix them if they are.

## Solution

We used the following SQL queries to check if the auto-increment columns are in sync or not:

```sql
SELECT MAX("Id") FROM "MyTable";

SELECT nextVal('"MyTable_Id_seq"');
```

> The sequence convention is *<<TableName>>_<<AutoIncrementColumnName>>_seq*. Thus, if you have this problem and want to check it, don't forget to change it according to your database table and column name.

We executed these queries one by one and were expecting the second query to return a lower value than the first one. Indeed the first query returned *86,800* and the second one returned  *125*.  It was obvious that they were out of sync, so we needed to sync them. To do this, we used the `setval` method and set the next sequence value as ***max_sequence_value + 1***. 

We used the following query for this purpose:

```sql
SELECT setval('"MyTable_Id_seq"', (SELECT MAX("Id") FROM "MyTable")+1);
```

Then, we executed the first two queries above to check the sequence was in sync again. The results were correct for this time and the problem was resolved.

## Conclusion

In this article, I wanted to show you how to reset auto-increment columns' sequences. This problem might occur for several reasons, such as while migrating data from a database to a new one (like in our case), or an unsuccessful insert attempt etc.

---

Thanks for reading the article. I hope you found the article helpful, see you in the next one.
