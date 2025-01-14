BEGIN TRANSACTION;

CREATE TABLE login (
    id serial PRIMARY KEY,
    hash VARCHAR(200) NOT NULL,
    email text UNIQUE NOT NULL,
    reset_token text UNIQUE,
    reset_expiration TIMESTAMP
);

COMMIT;