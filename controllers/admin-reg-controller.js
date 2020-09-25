/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

const adminRegController = (errResponse, AuthModel, AdminModel) => {
  const createAdmin = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // get request data for utilization purposes
    const reqBody = { ...req.body };

    // hash user password
    const salt = genSaltSync(10);
    return hash(reqBody.password, salt)
      .then(async (hashString) => {
        // overwrite password with its hash version
        reqBody.password = hashString;
        reqBody.role = 'admin';
        reqBody.active = true;

        // save auth data to database
        const newAuth = new AuthModel(reqBody);
        return newAuth.save()
          .then((authResult) => {
            reqBody.authId = authResult._id;

            // save admin data to database
            const newAdmin = new AdminModel(reqBody);
            return newAdmin.save()
              .then(() => {
                const { email } = reqBody;
                const subject = 'Activate Account';
                const text = 'Login and change your default password';
                const htmlBody = `
                  <p>
                    Dear Admin,
                  </p>
                  <br/>
                  <p>
                    Congratulations! You are now an Admin at
                    <span style='background-color: gray;'> Give To Charity</span>,
                    and you are required to change your default password.
                  </p>
                  <br/>
                  <p>
                    Username: ${email}
                  </p>
                  <p>
                    Password: ${req.body.password}
                  </p>
                  <br/>
                  <p>
                    This will last for only 48hrs.
                  </p>
                  <p>
                    Thanks,
                    <br/>
                    The 
                    <span style='background-color: gray;'> Give To Charity</span>
                    team.
                  </p>
                `;
                const html = htmlWrapper(htmlBody, 'Admin Registration');
                mailer(email, subject, text, html)
                  .catch((err) => logger.error(err.message));

                return res
                  .status(201)
                  .json({
                    message: `Admin account successfully created. Verify the account at ${email}`,
                  });
              })
              .catch((err) => {
                switch (err.code) {
                  case 11000:
                    return errResponse(res, 403, 'User already exists');

                  default:
                    return errResponse(res, 500, null, err);
                }
              });
          })
          .catch((err) => {
            switch (err.code) {
              case 11000:
                return errResponse(res, 403, 'User already exists');

              default:
                return errResponse(res, 500, null, err);
            }
          });
      })
      .catch((err) => errResponse(res, 500, null, err));
  };

  return { createAdmin };
};

module.exports = adminRegController;
