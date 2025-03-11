-- Sprawdzenie czy Masking Policy jest nałożona
SELECT
    t.table_schema,
    t.table_name,
    c.column_name,
    m.masking_policy_name
FROM
    information_schema.columns c
JOIN
    pg_catalog.pg_masking_policies m
    ON c.column_name = m.column_name
JOIN
    information_schema.tables t
    ON t.table_schema = c.table_schema
    AND t.table_name = c.table_name
WHERE
    t.table_type = 'BASE TABLE'
    AND m.masking_policy_name IS NOT NULL
    AND t.table_name = '<your_table_name>'  -- Replace with your table name
    AND t.table_schema = '<your_schema_name>'; -- Replace with your schema name


--Widoki pokazujące MASKING POLICY
select * from svv_masking_policy LIMIT 100;
select * from svv_attached_masking_policy LIMIT 100;
