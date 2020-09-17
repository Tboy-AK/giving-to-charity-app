/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');

const authController = (errResponse) => {
  const refreshAccess = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const { authId, email, role } = req.body;

    // create user access token
    const userPayload = {
      authId,
      email,
    };
    const accessTokenOptions = {
      algorithm: 'HS256',
      audience: role,
      expiresIn: 600,
      issuer: 'GiveToCharity',
    };
    const accessToken = sign(
      userPayload, process.env.RSA_PRIVATE_KEY, accessTokenOptions,
    );

    const refreshExpSeconds = 30 * 24 * 3600;
    const refreshTokenOptions = { ...accessTokenOptions, expiresIn: refreshExpSeconds };
    const refreshToken = sign(
      userPayload,
      process.env.RSA_PRIVATE_KEY,
      refreshTokenOptions,
    );

    const version = process.env.VERSION || 'v1.0.0';
    const cookieOptions = {
      maxAge: refreshExpSeconds * 1000,
      secure: false,
      sameSite: 'none',
      httpOnly: false,
      path: `/api/${version}/auths/session`,
      domain: req.hostname !== 'localhost' ? `.${req.hostname}` : 'localhost',
    };

    return res
      .status(200)
      .header('Authorization', accessToken)
      .cookie('GiveToCharity-Refresh', refreshToken, cookieOptions)
      .json({
        message: 'Successfully logged in',
        accessExp: accessTokenOptions.expiresIn,
        refreshExp: refreshTokenOptions.expiresIn,
      });
  };

  return { refreshAccess };
};

module.exports = authController;
