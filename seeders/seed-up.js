/* eslint-disable no-plusplus */
const { db } = require('../configs/mongodb-config');
const logger = require('../utils/winston-logger');

// Models
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const SubscriberModel = require('../models/mongodb-models/subscriber-model');
const SDGModel = require('../models/mongodb-models/sdg-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const ProhibitedItemModel = require('../models/mongodb-models/prohibited-donation-item-model');

// Data
const { data: adminAuthsData } = require('./data/admin-auths-data');
const { data: ngoAuthsData } = require('./data/ngo-auths-data');
const { data: adminsData } = require('./data/admins-data');
const sdgsData = require('./data/sdgs-data.json');
const { data: subscribersData } = require('./data/subscribers-data');
const { data: ngosData } = require('./data/ngos-data');
const { data: eventsData } = require('./data/events-data');
const prohibitedItemsData = require('./data/prohibited-donation-items-data.json');

const processCount = 8;
let processErrorCount = 0;
let processSuccessCount = 0;

const exitProcess = (err, processDBName) => {
  if (err) {
    processErrorCount++;
    logger.error(err.message, { processDBName });
  } else {
    processSuccessCount++;
  }
  if (processErrorCount + processSuccessCount === processCount) {
    logger.info(`${processSuccessCount}/${processCount} seedups done`);
    process.exit();
  }
};

db.dropDatabase()
  .then(async () => {
    AuthModel.insertMany(adminAuthsData, (err) => exitProcess(err, 'adminAuths'));

    AuthModel.insertMany(ngoAuthsData, (err) => exitProcess(err, 'ngoAuths'));

    AdminModel.insertMany(adminsData, (err) => exitProcess(err, 'admins'));

    SubscriberModel.insertMany(subscribersData, (err) => exitProcess(err, 'subscribers'));

    SDGModel.insertMany(sdgsData, (err) => exitProcess(err, 'sdgs'));

    NGOModel.insertMany(ngosData, (err) => exitProcess(err, 'ngos'));

    EventModel.insertMany(eventsData, (err) => exitProcess(err, 'events'));

    ProhibitedItemModel.insertMany(prohibitedItemsData, (err) => exitProcess(err, 'prohibited items'));
  })
  .catch((err) => {
    logger.error(err.message);
    process.exit();
  });
