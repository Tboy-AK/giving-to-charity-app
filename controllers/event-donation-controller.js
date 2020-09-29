/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

const donationController = (errResponse, DonationModel, EventModel, AuthModel) => {
  const donateItem = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    // Get request data for utilization purposes
    const reqBody = { ...req.body };
    reqBody.logistics = req.query.logistics;

    // Save donation data to database
    const donationModel = new DonationModel(reqBody);
    return donationModel.save()
      .then(async () => {
        const eventDoc = await EventModel
          .findById(req.params.eventId, 'ngoId')
          .populate('ngoId', 'authId');
        const reqErr = new Error('Resource not found');
        reqErr.code = 404;
        if (!eventDoc) throw reqErr;

        const authDoc = await AuthModel
          .findById(eventDoc.ngoId.authId, 'email')
          .populate('ngoId', 'authId');
        if (!authDoc) throw reqErr;

        const domain = `https://${process.env.DOMAIN}`;

        // Notify NGO via email
        {
          const { email } = req.body;
          const subject = 'New Donation';
          const text = 'A new donation has been made to your account';
          const htmlBody = `
                <p>
                  Hi there,
                </p>
                <br/>
                <p>
                  A new donation has been created to your account.
                </p>
                <br/>
                <p>
                  Thanks,
                  <br/>
                  The  
                  <a href='${domain}' style='font-size: 2rem;'>
                    Give To Charity
                  </a>
                  team.
                </p>
              `;
          const html = htmlWrapper(htmlBody, 'Event Creation');
          mailer(email, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        // Notify donor via email
        {
          const { email } = authDoc;
          const subject = 'New Donation';
          const text = 'A new donation has been made on your account';
          const htmlBody = `
                <p>
                  Hi there,
                </p>
                <br/>
                <p>
                  A new donation has been created on your account.
                </p>
                <br/>
                <p>
                  Thanks,
                  <br/>
                  The  
                  <a href='${domain}' style='font-size: 2rem;'>
                    Give To Charity
                  </a>
                  team.
                </p>
              `;
          const html = htmlWrapper(htmlBody, 'Event Creation');
          mailer(email, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        return res
          .status(201)
          .json({
            message: 'Donation submitted succesfully',
          });
      })
      .catch((err) => {
        if (err.code) {
          switch (err.code) {
            case 11000:
              return errResponse(res, 400, 'Event already exists');

            case 404:
              return errResponse(res, 404, err.message);

            default:
              return errResponse(res, 500, null, err);
          }
        }

        switch (err.name) {
          case 'ValidationError':
            return errResponse(res, 400, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  return { donateItem };
};

module.exports = donationController;
