/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

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
            ngoEvent.socialMedia.forEach((e, i) => {
              const { name, url } = e;
              // eslint-disable-next-lin
              resNGOEvent.socialMedia[i] = { name, url };
            });

            const domain = `https://${process.env.DOMAIN}`;

            // Notify NGO via email
            {
              const htmlFooter = `
                <p>
                  Thanks,
                  <br/>
                  The 
                  <span style='background-color: gray;'> Give To Charity</span>
                  team.
                </p>
              `;
              const { email } = req.headers.useraccesspayload;
              const subject = 'New Event';
              const text = `A new event titled "${reqBody.name}" has been created on your account`;
              const htmlBody = `
                <main class='container'>
                  <section class='Intro container'>
                    <p>
                      Dear ${ngoResult.name},
                    </p>
                    <br/>
                    <p>
                      A new event titled
                      <span style='font-weight: 700;'> "${reqBody.name}" </span>
                      has been created on your account. Confirm this 
                      <a href='${domain}/ngo/${req.params.ngoId}/event/${resNGOEvent._id}'>
                        here
                      </a>.
                      If this wasn't you, please retract and report to the 
                      <a href='${domain}/support'>
                        support
                      </a>
                      team, else, you're good to go.
                    </p>
                  </section>
                </main>
              `;
              const html = htmlWrapper(htmlBody, 'Event Creation', htmlFooter);
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

  const listEvents = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { page, limit } = req.query;

    return EventModel
      .find(
        { ngoId: req.params.ngoId },
        '-updatedAt',
        { skip: page * limit, limit },
      )
      .then((eventDocs) => res
        .status(200)
        .json({
          message: 'Success',
          data: eventDocs,
          count: eventDocs.length,
        }))
      .catch((err) => {
        switch (err) {
          case 'ValidationError':
            return errResponse(res, 400, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  const viewEvent = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { ngoId, eventId } = req.params;

    return EventModel
      .findOne({ _id: eventId, ngoId }, '-updatedAt')
      .populate('eventDonations')
      .then((eventDoc) => {
        if (!eventDoc) {
          const controllerError = new Error('Resource not found');
          controllerError.name = 'NotFoundError';
          throw controllerError;
        }
        return res
          .status(200)
          .json({
            message: 'Success',
            data: {
              event: eventDoc,
              donations: eventDoc.eventDonations,
            },
          });
      })
      .catch((err) => {
        switch (err.name) {
          case 'NotFoundError':
            return errResponse(res, 404);

          case 'ValidationError':
            return errResponse(res, 400, err.message);

          default:
            return errResponse(res, 500, null, err);
        }
      });
  };

  return { createEvent, listEvents, viewEvent };
};

module.exports = eventController;
