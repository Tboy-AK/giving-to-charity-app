/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const { compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');

const authController = (errResponse, AuthModel) => {
  const userSignin = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const reqBody = req.body;

    // check that user exists
    return AuthModel.findOne({ email: reqBody.email })
      .then((authResult) => {
        if (!authResult) return errResponse(res, 401);

        // compare user password
        return compare(reqBody.password, authResult.password)
          .then(async (isPasswordValid) => {
            if (!isPasswordValid) return errResponse(res, 401, 'Incorrect password');

            // create user access token
            const userPayload = {
              authId: authResult._id,
              email: authResult.email,
            };
            const accessTokenOptions = {
              algorithm: 'HS256',
              audience: authResult.role,
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
              path: `/api/${version}/auth/session`,
              domain: req.hostname !== 'localhost' ? `.${req.hostname}` : 'localhost',
            };

            return res
              .status(200)
              .header('Authorization', accessToken)
              .cookie('GiveToCharity-Refresh', refreshToken, cookieOptions)
              .json({
                authId: authResult._id,
                message: 'Successfully logged in',
                accessExp: accessTokenOptions.expiresIn,
                refreshExp: refreshTokenOptions.expiresIn,
              });
          })
          .catch((err) => errResponse(res, 500, null, err));
      })
      .catch((err) => errResponse(res, 500, null, err));
  };

  return { userSignin };
};

module.exports = authController;
