-- Create database if not exists
SELECT 'CREATE DATABASE alem_crm'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'alem_crm')\gexec

-- Connect to the database
\c alem_crm

-- Run the schema
\i 'c:/Users/Milion''s/Desktop/Alem Trading/alem-crm-system/database/schema.sql'
