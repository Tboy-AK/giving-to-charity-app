const winston = require('winston');

const newDate = new Date();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { timeStamp: `${newDate.toLocaleString()} ${newDate.getMilliseconds()}` },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ dirname: 'logs', filename: 'error.log', level: 'error' }),
    //
    // - Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ dirname: 'logs', filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
