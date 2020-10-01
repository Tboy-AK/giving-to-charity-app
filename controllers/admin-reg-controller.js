/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');
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
          .then((authDoc) => {
            reqBody.authId = authDoc._id;

            // save admin data to database
            const newAdmin = new AdminModel(reqBody);
            return newAdmin.save()
              .then(() => {
                // create user access token
                const authId = authDoc._id;
                const userPayload = {
                  authId,
                  email: authDoc.email,
                };
                const userRole = authDoc.role;
                const accessTokenOptions = {
                  algorithm: 'HS256',
                  audience: userRole,
                  expiresIn: 3600 * 24 * 7,
                  issuer: 'GiveToCharity',
                };
                const authActivateToken = sign(
                  userPayload, process.env.RSA_PRIVATE_KEY, accessTokenOptions,
                );

                // Send email notification to the new subscriber
                const domain = `https://${process.env.DOMAIN}`;

                const htmlFooter = `
                  <p>
                    Thanks,
                    <br/>
                    The 
                    <span style='background-color: gray;'> Give To Charity</span>
                    team.
                  </p>
                `;
                const { email } = reqBody;
                const subject = 'Activate Account';
                const text = 'Login and change your default password';
                const htmlBody = `
                  <main class='container'>
                    <p>
                      Dear Admin,
                    </p>
                    <br/>
                    <p>
                      Congratulations! You are now an Admin at
                      <span style='background-color: gray;'> Give To Charity</span>,
                      and you are required to change your default password.
                    </p>
                    <p>
                      But before then, activate your account at
                      <a href='${domain}/auth/activate/${authActivateToken}'>
                        ${domain}/auth/activate/${authActivateToken}
                      </a>. The link expires in 7 days.
                    </p>
                    <h2>Login Details</h2>
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
                  <main>
                `;
                const html = htmlWrapper(htmlBody, 'Admin Registration', htmlFooter);
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
