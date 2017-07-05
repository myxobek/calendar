-- Table: users

-- DROP TABLE users;

CREATE TABLE users
-- Table: users

-- DROP TABLE users;

CREATE TABLE users
(
  id serial NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  options hstore,
  CONSTRAINT users_id_pk PRIMARY KEY (id),
  CONSTRAINT users_email_unique UNIQUE (email)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO calendar;



-- password: 11111111
INSERT INTO users(
            email, password, options)
    VALUES ('admin@admin.admin', crypt('72eebf495961d59e147967af6c2e121d004378eb30db37d3e3ee386dbc26a0e41a6ba9c73a917416878b79ad67789976e4238ecd9e0b5709cfefdca43b26c124', gen_salt('bf',10)), hstore('is_admin'::text, 1::text));

