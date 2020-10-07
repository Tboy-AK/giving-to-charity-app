const express = require('express');
const { createEngine } = require('express-react-views');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/winston-logger');
const setResHeaders = require('./middleware/headers-middleware');
require('dotenv').config();

// Routers
const { ApiHomeRouter } = require('./routers/api-home-router');
const { AdminRegRouter } = require('./routers/admin-reg-router');
const { AuthRouter } = require('./routers/auth-router');
const { NGORegRouter } = require('./routers/ngo-reg-router');
const { NGOEventRouter } = require('./routers/ngo-event-router');
const { SubscriberRouter } = require('./routers/subscriber-router');
const { UserDonationItemRouter } = require('./routers/user-donation-item-router');
const { NGODonationRouter } = require('./routers/ngo-donation-router');
const { EventDonationRouter } = require('./routers/event-donation-router');
const { EventRouter } = require('./routers/event-router');
const { NGOItemNeedsRouter } = require('./routers/ngo-item-need-router');
const { NGOEventItemNeedsRouter } = require('./routers/ngo-event-item-need-router');

const { urlencoded, json } = express;

const server = express();

server.set('views', `${__dirname}/views`);
server.set('view engine', 'jsx');
server.engine('jsx', createEngine());

// Server logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
server.use([
  morgan('combined'),
  morgan('combined', { stream: accessLogStream }),
]);

// Parse Content-Type
server.use([urlencoded({ extended: false }), json()]);

// Set server response headers
server.use(setResHeaders);

const version = process.env.VERSION || 'v1.0.0';
server.use(`/api/${version}`, [
  ApiHomeRouter,
  AdminRegRouter,
  AuthRouter,
  NGORegRouter,
  NGOEventRouter,
  SubscriberRouter,
  UserDonationItemRouter,
  NGODonationRouter,
  EventDonationRouter,
  EventRouter,
  NGOItemNeedsRouter,
  NGOEventItemNeedsRouter,
]);

const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

module.exports = server.listen(port, () => {
  logger.info(`Listening on ${hostname}:${port}`);
});
