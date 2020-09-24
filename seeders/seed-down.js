const { db } = require('../configs/mongodb-config');
const logger = require('../utils/winston-logger');

module.exports = db.dropDatabase((err) => {
  if (err) return logger.error(err.message);
  return process.exit();
});
