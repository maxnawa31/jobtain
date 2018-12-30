# Jobtain

Job tracker for job seekers.

### Set up
Database setup 

```sql
DROP DATABASE IF EXISTS jobtain;

CREATE DATABASE jobtain;

\c jobtain;

CREATE TABLE users (id SERIAL PRIMARY KEY, firstname TEXT, lastname TEXT, username TEXT, email TEXT, password TEXT);

CREATE TABLE companies (id SERIAL PRIMARY KEY, name TEXT);

CREATE TYPE app_status AS ENUM ('Interested', 'Applied', 'Interview', 'Not A Fit', 'Accepted');

CREATE TABLE applications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users (id) ON DELETE CASCADE, company_id INTEGER REFERENCES companies (id) ON DELETE CASCADE, job_title TEXT, location TEXT, status app_status);

ALTER TABLE ONLY applications ALTER COLUMN status SET DEFAULT 'Interested';

```


### Tests
