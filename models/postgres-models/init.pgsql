-- CREATE SEQUENCES

CREATE SEQUENCE IF NOT EXISTS auth_id_seq;
CREATE SEQUENCE IF NOT EXISTS admin_id_seq;


-- CREATE FUNCTIONS

CREATE FUNCTION PUBLIC.timestamp_on_create()
  RETURNS TRIGGER
  LANGUAGE 'plpgsql'
  COST 100
  VOLATILE NOT LEAKPROOF
AS $BODY$ BEGIN
  NEW.created_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END; $BODY$;

COMMENT ON FUNCTION PUBLIC.timestamp_on_create()
  IS 'Time stamp to track the date and time the data on a row was created';

CREATE FUNCTION PUBLIC.timestamp_on_modify()
  RETURNS TRIGGER
  LANGUAGE 'plpgsql'
  COST 100
  VOLATILE NOT LEAKPROOF
AS $BODY$ BEGIN
  NEW.modified_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END; $BODY$;

COMMENT ON FUNCTION PUBLIC.timestamp_on_modify()
  IS 'Time stamp to track the date and time the data on a row was modified';


CREATE FUNCTION row_version_on_modify()
  RETURNS TRIGGER
  LANGUAGE 'plpgsql'
  COST 100
  VOLATILE NOT LEAKPROOF
AS $BODY$ BEGIN
  NEW._v := NEW._v + 1;
  RETURN NEW;
END; $BODY$;

COMMENT ON FUNCTION row_version_on_modify()
  IS 'Version recorder to monitor changes made on a row of data';


-- DROP ALL TABLES

DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS admin CASCADE;


-- CREATE ENUMS
  
CREATE TYPE "USER_TYPE" AS ENUM ('admin', 'ngo');


-- CREATE TABLES

CREATE TABLE IF NOT EXISTS auth (
  _id INTEGER GENERATED ALWAYS AS IDENTITY,
  email CHARACTER VARYING (100) COLLATE pg_catalog."default" NOT NULL,
  phone CHARACTER VARYING (20) COLLATE pg_catalog."default" NOT NULL,
  password CHARACTER VARYING (1024) COLLATE pg_catalog."default" NOT NULL,
  user_type "USER_TYPE" NOT NULL,
  _v INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  modified_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT auth_pkey PRIMARY KEY (_id),
  CONSTRAINT auth_email_key UNIQUE (email),
  CONSTRAINT auth_phone_key UNIQUE (phone)
);

COMMENT ON TABLE PUBLIC.auth
  IS 'Table where registered app users are recorded';


CREATE TABLE IF NOT EXISTS admin (
  _id INTEGER GENERATED ALWAYS AS IDENTITY,
  auth_id INTEGER NOT NULL,
  first_name CHARACTER VARYING (20) COLLATE pg_catalog."default" NOT NULL,
  last_name CHARACTER VARYING (20) COLLATE pg_catalog."default" NOT NULL,
  _v INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  modified_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT admin_pkey PRIMARY KEY (_id),
  CONSTRAINT admin_auth_id_key UNIQUE (auth_id),
  CONSTRAINT admin_auth_id_fkey FOREIGN KEY (auth_id)
    REFERENCES PUBLIC.auth (_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

COMMENT ON TABLE PUBLIC.admin
  IS 'Table where the admin are recorded';


-- CREATE TRIGGER

CREATE TRIGGER auth_timestamp_on_create
  BEFORE INSERT
  ON PUBLIC.auth
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.timestamp_on_create();


CREATE TRIGGER auth_timestamp_on_modify
  BEFORE INSERT OR UPDATE
  ON PUBLIC.auth
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.timestamp_on_modify();


CREATE TRIGGER auth_row_version_on_modify
  BEFORE UPDATE
  ON PUBLIC.auth
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.row_version_on_modify();


CREATE TRIGGER admin_timestamp_on_create
  BEFORE INSERT
  ON PUBLIC.admin
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.timestamp_on_create();


CREATE TRIGGER admin_timestamp_on_modify
  BEFORE INSERT OR UPDATE
  ON PUBLIC.admin
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.timestamp_on_modify();


CREATE TRIGGER admin_row_version_on_modify
  BEFORE UPDATE
  ON PUBLIC.admin
  FOR EACH ROW
  EXECUTE PROCEDURE PUBLIC.row_version_on_modify();
  