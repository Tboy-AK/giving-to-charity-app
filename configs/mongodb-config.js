const mongoose = require('mongoose');
const logger = require('../utils/winston-logger');
require('dotenv').config();

let dbConnectionString;

switch (process.env.NODE_ENV) {
  case 'development':
    dbConnectionString = process.env.DEV_MONGO_DATABASE_URL;
    break;

  case 'test':
    dbConnectionString = process.env.TEST_MONGO_DATABASE_URL;
    break;

  default:
    dbConnectionString = process.env.MONGO_DATABASE_URL;
    break;
}

mongoose.Promise = Promise;
mongoose.connect(
  dbConnectionString,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
);
const db = mongoose.connection;
db.on('error', logger.error.bind(console, 'connection error:'));

module.exports = { mongoose, db };
