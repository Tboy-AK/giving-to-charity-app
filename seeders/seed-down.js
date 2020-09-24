const { db } = require('../configs/mongodb-config');
const logger = require('../utils/winston-logger');

db.dropDatabase((err) => {
  if (err) logger.error(err.message);
  logger.info('Finished successfully');
  process.exit();
});
