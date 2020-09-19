/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');
const mailer = require('../utils/email-handler');

const ngoRegController = (errResponse, AuthModel, NGOModel) => {
  const createNGO = (req, res) => {
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
        reqBody.role = 'ngo';
        reqBody.active = false;

        // save auth data to database
        const newAuth = new AuthModel(reqBody);
        return newAuth.save()
          .then((authResult) => {
            reqBody.authId = authResult._id;

            // save ngo data to database
            const newNGO = new NGOModel(reqBody);
            return newNGO.save()
              .then(() => {
                const { email } = reqBody;
                const subject = 'Registered NGO';
                const text = 'Your registration has been received';
                const html = `
                  <p>
                    Dear NGO,
                  </p>
                  <br/>
                  <p>
                    Just little time before the final steps are completed!
                    Please, go through our user guide for NGOs if you have not
                    while we process your account.
                  </p>
                  <br/>
                  <p>
                    Thanks,
                    <br/>
                    The 
                    <span style='background-color: gray;'> Give To Charity</span>
                    team.
                  </p>
                `;
                mailer(email, subject, text, html)
                  .catch(() => null);

                return res
                  .status(201)
                  .json({
                    message: `NGO registration successfully completed. Verify the account at ${email}`,
                  });
              })
              .catch((ngoErr) => {
                if (ngoErr.code) {
                  switch (ngoErr.code) {
                    case 11000:
                      return errResponse(res, 403, 'User already exists');

                    default:
                      return errResponse(res, 500, null, ngoErr);
                  }
                }

                switch (ngoErr.name) {
                  case 'ValidationError':
                    return errResponse(res, 400, ngoErr.message);

                  default:
                    return errResponse(res, 500, null, ngoErr);
                }
              });
          })
          .catch((authErr) => {
            if (authErr.code) {
              switch (authErr.code) {
                case 11000:
                  return errResponse(res, 403, 'User already exists');

                default:
                  return errResponse(res, 500, null, authErr);
              }
            }

            switch (authErr.name) {
              case 'ValidatorError':
                return errResponse(res, 400, authErr.message);

              default:
                return errResponse(res, 500, null, authErr);
            }
          });
      })
      .catch((err) => errResponse(res, 500, null, err));
  };

  return { createNGO };
};

module.exports = ngoRegController;
