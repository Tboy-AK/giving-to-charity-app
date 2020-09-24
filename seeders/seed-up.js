const logger = require('../utils/winston-logger');

// Models
const AuthModel = require('../models/mongodb-models/sdg-model');
const AdminModel = require('../models/mongodb-models/sdg-model');
const SubscriberModel = require('../models/mongodb-models/sdg-model');
const SDGModel = require('../models/mongodb-models/sdg-model');
const NGOModel = require('../models/mongodb-models/sdg-model');
const EventModel = require('../models/mongodb-models/sdg-model');

// Data
const adminAuthsData = require('./data/admin-auths-data');
const ngoAuthsData = require('./data/ngo-auths-data');
const adminsData = require('./data/admins-data');
const subscribersData = require('./data/subscribers-data');
const sdgsData = require('./data/sdgs-data.json');
const ngosData = require('./data/ngos-data');
const eventsData = require('./data/events-data');

// Save new admin
AuthModel.insertMany(adminAuthsData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

AuthModel.insertMany(ngoAuthsData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

AdminModel.insertMany(adminsData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

SubscriberModel.insertMany(subscribersData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

SDGModel.insertMany(sdgsData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

NGOModel.insertMany(ngosData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});

EventModel.insertMany(eventsData, (err) => {
  if (err) return logger(err.message);
  return process.exit();
});
