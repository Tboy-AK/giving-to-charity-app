const { verify, TokenExpiredError } = require('jsonwebtoken');
const errResponse = require('../utils/error-response-handler');

const authRefresh = (req, res, next) => verify(
  req.cookies['GiveToCharity-Refresh'],
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
    req.body.authId = payload.authId;
    req.body.role = payload.aud;

    switch (payload.aud) {
      case 'superAdmin':
        req.body.userId = payload.superAdminId;
        break;

      case 'admin':
        req.body.userId = payload.adminId;
        break;

      case 'ngo':
        req.body.userId = payload.ngoId;
        break;

      default:
        return errResponse(res, 403);
    }

    return next();
  },
);

module.exports = authRefresh;
