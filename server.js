/* eslint-disable no-console */
const express = require('express');
const { createEngine } = require('express-react-views');
require('dotenv').config();

// Require routers
const { ApiHomeRouter } = require('./routers/api-home-router');

const { urlencoded, json } = express;

const server = express();

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

server.set('views', `${__dirname}/views`);
server.set('view engine', 'jsx');
server.engine('jsx', createEngine());

server.use([urlencoded({ extended: false }), json()]);

server.use('/api/v1.0.0', [
  ApiHomeRouter,
]);

module.exports = server.listen(port, () => {
  console.log(`Listening on ${hostname}:${port}`);
});
