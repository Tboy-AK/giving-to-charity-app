const { verify } = require('jsonwebtoken');
const errResponse = require('../utils/error-response-handler');

const authExpAccess = (req, res, next) => verify(
  req.headers.authorization,
  process.env.RSA_PRIVATE_KEY,
  {
    algorithms: ['HS256'],
    issuer: 'GiveToCharity',
    audience: ['superAdmin', 'admin', 'ngo'],
    ignoreExpiration: true,
  },
  (err, payload) => {
    if (err) {
      return errResponse(res, 403, null, err);
    }
    req.body.authId = payload.authId;
    req.body.role = payload.aud;
    req.body.email = payload.email;

    switch (payload.aud) {
      case 'superAdmin':
        req.body.superAdminId = payload.superAdminId;
        break;

      case 'admin':
        req.body.adminId = payload.adminId;
        break;

      case 'ngo':
        req.body.ngoId = payload.ngoId;
        break;

      default:
        return errResponse(res, 403);
    }

    return next();
  },
);

module.exports = authExpAccess;
