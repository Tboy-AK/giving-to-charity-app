/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');

const adminRegController = (errResponse, AuthModel, AdminModel) => {
  const createAdmin = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // get request data for utilization purposes
    const reqBody = req.body;

    // hash user password
    const salt = genSaltSync(10);
    return hash(reqBody.password, salt)
      .then(async (hashString) => {
        // overwrite password with its hash version
        reqBody.password = hashString;
        reqBody.role = 'admin';

        // save auth data to database
        const newAuth = new AuthModel(reqBody);
        newAuth.save((authErr, authResult) => {
          if (authErr) {
            switch (authErr.code) {
              case 11000:
                return errResponse(res, 403, 'User already exists');

              default:
                return errResponse(res, 500, null, authErr);
            }
          }

          reqBody.authId = authResult._id;

          // save admin data to database
          const newAdmin = new AdminModel(reqBody);
          return newAdmin.save((adminErr) => {
            if (adminErr) {
              switch (adminErr.code) {
                case 11000:
                  return errResponse(res, 403, 'User already exists');

                default:
                  return errResponse(res, 500, null, adminErr);
              }
            }

            return res
              .status(201)
              .json({
                message: `Admin account successfully created. Check your email ${authResult.email} to activate your account.`,
              });
          });
        });
      })
      .catch((err) => errResponse(res, 500, null, err));
  };

  return { createAdmin };
};

module.exports = adminRegController;
