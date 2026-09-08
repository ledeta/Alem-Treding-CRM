-- STEP 1: Run this command FIRST in pgAdmin Query Tool (connected to 'postgres' database)
-- This creates the database

CREATE DATABASE alem_crm
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- STEP 2: After database is created, disconnect and reconnect to 'alem_crm' database
-- Then run the schema.sql file
