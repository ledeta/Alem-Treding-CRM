-- RECREATE DATABASE FOR ALEM CRM
-- Run this in DBeaver or pgAdmin connected to 'postgres' database

-- Step 1: Terminate all connections to alem_crm
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'alem_crm'
  AND pid <> pg_backend_pid();

-- Step 2: Drop the database
DROP DATABASE IF EXISTS alem_crm;

-- Step 3: Create fresh database
CREATE DATABASE alem_crm
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Done! Now restart the backend and it will create all tables fresh.
