const { Pool } = require('pg');
require('dotenv').config();

const connObj = {};

switch (process.env.NODE_ENV) {
  case 'development':
    connObj.connectionString = process.env.DEV_PG_DATABASE_URL;
    break;
  case 'test':
    connObj.user = process.env.TEST_PG_USER;
    connObj.password = process.env.TEST_PG_PASSWORD;
    connObj.host = process.env.TEST_PG_HOST;
    connObj.port = process.env.TEST_PG_PORT;
    connObj.database = process.env.TEST_PG_DATABASE;
    break;
  default:
    connObj.connectionString = process.env.PG_DATABASE_URL;
    break;
}

module.exports = new Pool(connObj);
