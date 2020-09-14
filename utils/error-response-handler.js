const logger = require('./winston-logger');

/**
 * @description Returns an error response
 * @param {Response} res http response object
 * @param {Number} [status=500] http error status
 * @param {String} message custom error message
 * @returns {Response} http response with error status and message
 */

module.exports = (res, status = 500, message, err) => {
  logger.error(err.message);

  let errMessage;
  if (message == null) {
    switch (status) {
      case 400:
        errMessage = 'User request error';
        break;
      case 401:
        errMessage = 'User not recognized';
        break;
      case 403:
        errMessage = 'Access denied';
        break;
      case 404:
        errMessage = 'Resource not found';
        break;
      case 406:
        errMessage = 'Non-conforming data cannot be processed';
        break;
      case 422:
        errMessage = 'Invalid request parameters';
        break;
      case 501:
        errMessage = 'Service not implemented';
        break;
      default:
        errMessage = 'Internal server error';
        break;
    }
  } else {
    errMessage = message;
  }
  return res.status(status).send(errMessage);
};
