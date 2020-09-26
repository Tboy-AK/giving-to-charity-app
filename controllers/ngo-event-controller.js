/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');

const eventController = (errResponse, NGOModel, EventModel) => {
  const createEvent = async (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    // get request data for utilization purposes
    const reqBody = { ...req.body };

    // find NGO
    return NGOModel.findById(req.params.ngoId)
      .then((ngoResult) => {
        reqBody.ngoId = ngoResult._id;

        // save ngo data to database
        const newEvent = new EventModel(reqBody);
        return newEvent.save()
          .then(async (ngoEvent) => {
            // Send email to NGO
            // Filter out only data necessary for response
            const resNGOEvent = ngoEvent;
            resNGOEvent.socialMedia.forEach((e, i) => {
              const { name, url } = e;
              // eslint-disable-next-lin
              resNGOEvent.socialMedia[i] = { name, url };
            });

            const domain = `https://${process.env.DOMAIN}`;
            const api = `https://${process.env.DOMAIN}/api/${process.env.VERSION}`;

            // Notify NGO via email
            {
              const { email } = req.headers.useraccesspayload;
              const subject = 'New Event';
              const text = `A new event titled "${reqBody.name}" has been created on your account`;
              const html = `
              <p>
                Dear ${ngoResult.name},
              </p>
              <br/>
              <p>
                A new event titled
                <span style='font-weight: 700;'> "${reqBody.name}" </span>
                has been created on your account. Confirm this 
                <a href='${api}/ngo/${req.params.ngoId}/event/${resNGOEvent._id}'>
                  here
                </a>.
                If this wasn't you, please retract and report to the 
                <a href='${api}/support'>
                  support
                </a>
                 team, else, you're good to go.
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
              mailer(email, subject, text, html)
                .catch((err) => logger.error(err.message));
            }

            (() => {
              /**
               * Notify relevant subscribers via email
               */
            })();

            return res
              .status(201)
              .json({
                data: resNGOEvent,
                message: 'Event successfully created',
              });
          })
          .catch((err) => {
            if (err.code) {
              switch (err.code) {
                case 11000:
                  return errResponse(res, 400, 'Event already exists');

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
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidatorError':
            return errResponse(res, 400, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  return { createEvent };
};

module.exports = eventController;