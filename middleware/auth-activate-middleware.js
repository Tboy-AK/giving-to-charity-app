const { verify, TokenExpiredError } = require('jsonwebtoken');
const errResponse = require('../utils/error-response-handler');

const authAdmin = (req, res, next) => verify(
  req.params.authActivateToken,
  process.env.RSA_PRIVATE_KEY,
  {
    algorithms: ['HS256'],
    issuer: 'GiveToCharity',
    audience: ['superAdmin', 'admin', 'ngo'],
  },
  (err, payload) => {
    if (err) {
      if (err instanceof TokenExpiredError) return errResponse(res, 403, 'Session expired');
      return errResponse(res, 403, null, err);
    }
    req.headers.useraccesspayload = JSON.stringify(payload);
    return next();
  },
);

module.exports = authAdmin;
