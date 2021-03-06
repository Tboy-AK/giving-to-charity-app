/* eslint-disable no-underscore-dangle */
const { hash, genSaltSync } = require('bcryptjs');
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

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
          .then((authDoc) => {
            reqBody.authId = authDoc._id;

            // save ngo data to database
            const newNGO = new NGOModel(reqBody);
            return newNGO.save()
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
                const { origin } = req.headers;

                const htmlFooter = `
                  <p>
                    Thanks,
                    <br/>
                    The
                    <a href='${origin}' style='background-color: gray;'>Give To Charity</a> 
                    team.
                  </p>
                `;
                const { email } = reqBody;
                const subject = 'Registered NGO';
                const text = 'Your registration has been received';
                const htmlBody = `
                  <main class='container'>
                    <p>
                      Dear NGO,
                    </p>
                    <br/>
                    <p>
                      Just little time before the final steps are completed!
                      Please, go through our user guide for NGOs if you have not
                      while we process your account.
                    </p>
                    <p>
                      But before then, activate your account at 
                      <a href='${origin}/auth/activate/${authActivateToken}'>
                        ${origin}/auth/activate/${authActivateToken}
                      </a>.
                    </p>
                  </main>
                `;
                const html = htmlWrapper(htmlBody, 'NGO Registration', htmlFooter);
                mailer(email, subject, text, html)
                  .catch((err) => logger.error(err.message));

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

  const adminVerifyNGO = async (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const { ngoId } = req.params;

    // Get NGO email
    return NGOModel
      .findById(ngoId)
      .populate(
        'authId',
        'email',
        { activated: true, suspended: false },
      )
      .then(async (NGODoc) => {
        const ModelQueryErr = new Error('Resource not found');
        ModelQueryErr.name = 'NotFoundError';

        // Check that NGO exists
        if (!NGODoc) {
          throw ModelQueryErr;
        }

        const { email } = NGODoc.authId;

        // Check that NGO is activated and not suspended
        if (!email) {
          ModelQueryErr.message = 'Account cannot be verified. Either it is not activated or it is suspended.';
          ModelQueryErr.name = 'NotVerifiableError';
          throw ModelQueryErr;
        }

        // Verify NGO
        await NGOModel.findByIdAndUpdate(ngoId, { verified: true });
        const { origin } = req.headers;

        // Send email notification to the new subscriber
        const htmlFooter = `
          <p>
            Thanks,
            <br/>
            The 
            <a href='${origin}' style='background-color: gray;'>Give To Charity</a> 
            team.
          </p>
        `;
        const subject = 'Verified NGO';
        const text = 'Your registration has been received';
        const htmlBody = `
          <main class='container'>
            <p>
              Dear NGO,
            </p>
            <br/>
            <p>
              Your account is verified and you can now make use of the 
              <a href='${origin}/'>
                Give to Charity
              </a> 
              app platform to continue to impact society and the world at large.
            </p>
            </p>
          </main>
        `;
        const html = htmlWrapper(htmlBody, 'Verified NGO', htmlFooter);
        mailer(email, subject, text, html)
          .catch((err) => logger.error(err.message));

        return res
          .status(201)
          .json({
            message: 'NGO has been verified',
          });
      })
      .catch((err) => {
        switch (err.name) {
          case 'NotFoundError':
            return errResponse(res, 404);

          case 'ValidationError':
          case 'NotVerifiableError':
            return errResponse(res, 400, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  const listNGOs = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    const { page, limit } = req.query;

    // hash user password
    return NGOModel
      .find(
        { verified: true },
        '-verified -needs -socialMedia -vision -authId',
        { skip: page * limit, limit },
      )
      .then((ngoDocs) => {
        // check that NGOs are verified
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!ngoDocs) throw controllerError;

        return res
          .status(200)
          .json({
            message: 'NGOs successfully found',
            count: ngoDocs.length,
            data: ngoDocs,
          });
      })
      .catch((ngoErr) => {
        if (ngoErr.code) {
          switch (ngoErr.code) {
            default:
              return errResponse(res, 500, null, ngoErr);
          }
        }

        switch (ngoErr.name) {
          case 'ValidatorError':
          case 'NotFoundError':
            return errResponse(res, 400, ngoErr.message);

          default:
            return errResponse(res, 500, null, ngoErr);
        }
      });
  };

  const viewNGO = async (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // hash user password
    return NGOModel
      .findOne({ verified: true, _id: req.params.ngoId })
      .populate('authId', '-_id null', { suspended: false, activated: true })
      .then((ngoDoc) => {
        // check that NGO is fully verified
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!ngoDoc || !ngoDoc.authId) throw controllerError;
        const ngo = ngoDoc;

        // filter response body data
        ngo.authId = undefined;
        ngo.verified = undefined;

        return res
          .status(201)
          .json({
            message: 'NGO successfully found',
            data: ngo,
          });
      })
      .catch((authErr) => {
        if (authErr.code) {
          switch (authErr.code) {
            default:
              return errResponse(res, 500, null, authErr);
          }
        }

        switch (authErr.name) {
          case 'ValidatorError':
          case 'NotFoundError':
            return errResponse(res, 400, authErr.message);

          default:
            return errResponse(res, 500, null, authErr);
        }
      });
  };

  return {
    createNGO, adminVerifyNGO, listNGOs, viewNGO,
  };
};

module.exports = ngoRegController;
