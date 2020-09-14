const { verify, TokenExpiredError } = require('jsonwebtoken');
const errResponse = require('../utils/error-response-handler');

const authAdmin = (req, res, next) => verify(
  req.headers.authorization,
  process.env.RSA_PRIVATE_KEY,
  {
    algorithms: ['HS256'],
    issuer: 'GTCApp',
    audience: ['admin', 'ngo'],
  },
  (err, payload) => {
    if (err) {
      if (err instanceof TokenExpiredError) return errResponse(res, 403, 'Session expired');
      return errResponse(res, 403, null, err);
    }
    req.headers.accessTokenPayload = payload;
    return next();
  },
);

module.exports = authAdmin;