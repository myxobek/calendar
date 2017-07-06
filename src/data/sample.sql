-- Table: users

-- DROP TABLE users;

CREATE TABLE users
(
  id serial NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  options json,
  CONSTRAINT users_id_pk PRIMARY KEY (id),
  CONSTRAINT users_email_unique UNIQUE (email)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO calendar;

-- password: 1234567890
INSERT INTO users(
            email, password, options)
    VALUES ('admin@admin.admin', crypt('336afca29aae5249c1dcd7ff3599d822f864d81ad0b9a8815e1c2a2e2080191c', gen_salt('bf',10)), jsonb_build_object('is_admin'::text, 1::text));

-- Table: events

-- DROP TABLE events;

CREATE TABLE events
(
  id serial NOT NULL,
  title character varying(255) NOT NULL,
  date_from timestamp without time zone NOT NULL,
  date_till timestamp without time zone NOT NULL,
  description text,
  author_id integer NOT NULL,
  status smallint DEFAULT 1,
  color character varying(25),
  CONSTRAINT events_id_pk PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE events
  OWNER TO calendar;


