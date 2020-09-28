/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

const donationController = (errResponse, DonationModel, NGOModel) => {
  const donateItem = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    // Get request data for utilization purposes
    const reqBody = { ...req.body };
    reqBody.logistics = req.query.logisticsBy;

    // Save donation data to database
    const donationModel = new DonationModel(reqBody);
    return donationModel.save()
      .then(async () => {
        const ngoDoc = await NGOModel.findById(req.param.eventId, 'email');
        if (!ngoDoc) throw new Error('Resource not found');

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
          const { email } = ngoDoc;
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
            message: 'Donation application submitted succesfully',
          });
      })
      .catch(() => { });
  };

  return { donateItem };
};

module.exports = donationController;
