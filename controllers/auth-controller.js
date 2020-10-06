/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const { compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');

const authController = (errResponse, AuthModel, { AdminModel, NGOModel }) => {
  const userSignin = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const reqBody = req.body;

    // check that user exists
    return AuthModel.findOne({ email: reqBody.email, activated: true, suspended: false })
      .then((authResult) => {
        if (!authResult) return errResponse(res, 401);

        // confirm user password
        return compare(reqBody.password, authResult.password)
          .then(async (isPasswordValid) => {
            if (!isPasswordValid) return errResponse(res, 401, 'Incorrect password');

            // create user access token
            const authId = authResult._id;
            const userPayload = {
              authId,
              email: authResult.email,
            };
            const userRole = authResult.role;
            const accessTokenOptions = {
              algorithm: 'HS256',
              audience: userRole,
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
              path: `/api/${version}/auth/refresh`,
              domain: req.hostname !== 'localhost' ? `.${req.hostname}` : 'localhost',
            };

            let user;
            const userRoleErr = new Error('');

            switch (userRole) {
              case 'admin':
                user = await AdminModel.findOne({ authId })
                  .then((admin) => {
                    userRoleErr.message = 'Account not verified';
                    userRoleErr.code = 'AuthError';
                    if (!admin) throw userRoleErr;
                    return admin;
                  })
                  .catch((err) => {
                    throw err;
                  });
                break;

              case 'ngo':
                user = await NGOModel.findOne(
                  { authId, verified: true },
                )
                  .then((ngo) => {
                    userRoleErr.message = 'Account not verified';
                    userRoleErr.code = 'AuthError';
                    if (!ngo) throw userRoleErr;
                    return ngo;
                  })
                  .catch((err) => {
                    throw err;
                  });
                break;

              default:
                userRoleErr.message = 'Unrecognised user';
                userRoleErr.code = 'AuthError';
                throw userRoleErr;
            }

            return res
              .status(200)
              .header('Authorization', accessToken)
              .cookie('GiveToCharity-Refresh', refreshToken, cookieOptions)
              .json({
                message: 'Successfully logged in',
                data: {
                  userId: user._id,
                  role: userRole,
                  accessExp: accessTokenOptions.expiresIn,
                  refreshExp: refreshTokenOptions.expiresIn,
                },
              });
          })
          .catch((err) => {
            switch (err.code) {
              case 'AuthError':
                return errResponse(res, 403, err.message);

              default:
                return errResponse(res, 500, null, err);
            }
          });
      })
      .catch((err) => errResponse(res, 500, null, err));
  };

  const refreshAccess = async (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const { authId, email, role } = req.body;

    // create user access token
    const userPayload = { authId, email };

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
      path: `/api/${version}/auths/refresh`,
      domain: req.hostname !== 'localhost' ? `.${req.hostname}` : 'localhost',
    };

    return res
      .status(200)
      .header('Authorization', accessToken)
      .cookie('GiveToCharity-Refresh', refreshToken, cookieOptions)
      .json({
        message: 'Successfully refreshed access',
        data: {
          userId: req.query.userId,
          role,
          accessExp: accessTokenOptions.expiresIn,
          refreshExp: refreshTokenOptions.expiresIn,
        },
      });
  };

  const activateUser = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // check that user exists
    return AuthModel.findOneAndUpdate(
      {
        email: req.headers.useraccesspayload.email,
        activated: false,
      },
      {
        activated: true,
      },
    )
      .then((authDoc) => {
        if (!authDoc) return errResponse(res, 401);

        return res
          .status(200)
          .json({
            message: 'You can now log in',
            data: {},
          });
      })
      .catch((err) => {
        switch (err.code) {
          case 'AuthError':
            return errResponse(res, 403, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  return { activateUser, userSignin, refreshAccess };
};

module.exports = authController;
