/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');

const adminsController = (errResponse, AuthModel, AdminModel) => {
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
    return hash(reqBody.password, genSaltSync(10))
      .then(async (hashString) => {
        // overwrite password with its hash version
        reqBody.password = hashString;
        reqBody.userType = 'admin';

        // save auth data to database
        const newAuth = new AuthModel(reqBody);
        newAuth.save((authErr, authResult) => {
          if (authErr) {
            switch (authErr.code) {
              case 11000:
                return errResponse(res, 403, 'User already exists');

              default:
                return errResponse(res, 500, authErr.message);
            }
          }

          reqBody.authId = authResult._id;
          reqBody.registered = true;

          // save admin data to database
          const newAdmin = new AdminModel(reqBody);
          return newAdmin.save((adminErr) => {
            if (adminErr) {
              switch (adminErr.code) {
                case 11000:
                  return errResponse(res, 403, 'User already exists');

                default:
                  return errResponse(res, 500, adminErr.message);
              }
            }

            return res
              .status(201)
              .json({
                message: 'Admin account successfully created. Check email to see login details and change password.',
              });
          });
        });
      })
      .catch((err) => errResponse(res, 500, err.message));
  };

  return { createAdmin };
};

module.exports = adminsController;
