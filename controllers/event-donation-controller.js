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
    reqBody.eventId = req.params.eventId;

    // Save donation data to database
    const donationModel = new DonationModel(reqBody);
    return donationModel.save()
      .then(async (donationDoc) => {
        const eventDoc = await EventModel
          .findById(req.params.eventId, 'ngoId name')
          .populate('ngoId', 'authId');
        const reqErr = new Error('Resource not found');
        reqErr.code = 404;
        if (!eventDoc) throw reqErr;

        const authDoc = await AuthModel
          .findById(eventDoc.ngoId.authId, 'email')
          .populate('ngoId', 'authId');
        if (!authDoc) throw reqErr;

        const { origin } = req.headers;

        const itemParagraphListing = donationDoc.items.map(({
          name, quantity, unit, desc, purpose,
        }) => (`<tr class='ItemList'>
            <td className='ItemName' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${name}</td>
            <td className='ItemDesc' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${desc || ''}</td>
            <td className='ItemQuantity' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px; text-align: right;'>${quantity}</td>
            <td className='ItemQuantityUnit' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${unit}</td>
            <td className='ItemPurpose' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${purpose || ''}</td>
        <tr>`)).join('');

        const htmlFooter = `
          <p>
            Thanks,
            <br/>
            The 
            <span style='font-weight: 700;'> Give To Charity</span>
            team.
          </p>
        `;

        // Notify NGO via email
        {
          const donationHTMLSection = (() => {
            const { email, phone, dateTime } = donationDoc;
            const [date, time] = dateTime.toJSON().split('T');
            return (`<section class='DonationDesc container'>
            <h2>Donation Details</h2>
            <p class='PickupDateTime'>
              <span class='PickupDate' style='margin-right: 3em;'>Pickup Date: 
                <time datetime='${date}' class='badge badge-secondary'>${date}</time>
              </span>
              <span class='PickupTime'>Pickup Time:
                <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time>
              </span>
            </p>
            <div class='DonorContactDetails'>
              <h3>Donor Contact Details</h3>
              <p class='Email' style='margin-right: 3em;'>
                <span class='badge badge-secondary'>Email: </span>
                <a href='mailto:${email}' class='badge badge-secondary'>${email}</a>
              </p>
              <p class='Phone'>
                <span class='badge badge-secondary'>Phone: </span>
                <a href='tel:${phone}' class='badge badge-secondary'>${phone}</a>
              </p>
            </div>
            <div class='DonationItemDetails'>
              <h3>Donation Item Details</h3>
              <table style='border: 0.5px solid grey; border-collapse: collapse; color: #232323;'>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Purpose</th>
                </tr>
                ${itemParagraphListing}
              </table>
            </div>
          </section>`);
          })();
          const [date, time] = donationDoc.createdAt.toJSON().split('T');
          const { email } = authDoc;
          const subject = 'New Donation';
          const text = `A new donation has been made to your event ${eventDoc.name}`;
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br/>
                <p>
                  A new donation has been made to your event 
                  <span style='font-weight: 700;'>${eventDoc.name}</span> at ${time} on ${date}.
                  View more details at 
                  <a href='${origin}/ngos/${eventDoc.ngoId._id}/events/${donationDoc.eventId}/donations/${donationDoc._id}'>
                    ${origin}/ngos/${eventDoc.ngoId._id}/events/${donationDoc.eventId}/donations/${donationDoc._id}
                  </a>.
                </p>
              </section>
              ${donationHTMLSection}
            </main>
          `;
          const html = htmlWrapper(htmlBody, 'Donation', htmlFooter);
          mailer(email, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        // Notify donor via email
        {
          const donationHTMLSection = (() => {
            const [date, time] = donationDoc.dateTime.toJSON().split('T');
            return (`<section class='DonationDesc container'>
            <h2>Donation Details</h2>
            <p class='PickupDateTime'>
              <span class='PickupDate' style='margin-right: 3em;'>Pickup Date: 
                <time datetime='${date}' class='badge badge-secondary'>${date}</time>
              </span>
              <span class='PickupTime'>Pickup Time:
                <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time>
              </span>
            </p>
            <table style='border: 0.5px solid grey; border-collapse: collapse; color: #232323;'>
              <tr>
                <th style='padding: 6px;'>Name</th>
                <th style='padding: 6px;'>Description</th>
                <th style='padding: 6px;'>Quantity</th>
                <th style='padding: 6px;'>Unit</th>
                <th style='padding: 6px;'>Purpose</th>
              </tr>
              ${itemParagraphListing}
            </table>
          </section>`);
          })();
          const { createdAt, dateTime, pickup } = donationDoc;
          const [date, time] = createdAt.toJSON().split('T');
          const [pickupDate, pickupTime] = dateTime.toJSON().split('T');
          const { email } = req.body;
          const subject = 'New Donation';
          const text = `You subscribed to a new donation at ${time} on ${date} to the event ${eventDoc.name} of ${eventDoc.ngoId.name} for pickup on ${pickupDate} by ${pickupTime}${pickup ? ` at ${pickup.address}` : ''}.`;
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br/>
                <p>
                  You subscribed to a new donation at 
                  <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time> 
                  on <time datetime='${date}' class='badge badge-secondary'>${date}</time> 
                  to ${eventDoc.name} for pickup 
                  on <time datetime='${pickupDate}' class='badge badge-secondary'>${pickupDate}</time>  
                  by <time datetime='${pickupTime.replace('Z', '')}' class='badge badge-secondary'>${pickupTime}</time> 
                  ${pickup ? ` at ${pickup.address}` : ''}.
                  <br />
                  More details are as specified below.
                </p>
              </section>
              ${donationHTMLSection}
            </main>
          `;
          const html = htmlWrapper(htmlBody, 'Donation', htmlFooter);
          mailer(email, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        // Filter response data
        const resData = { ...donationDoc };
        delete resData._v;
        delete resData.updatedAt;

        return res
          .status(201)
          .json({
            message: 'Donation submitted succesfully',
            data: donationDoc,
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

  const listDonations = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { page, limit } = req.query;

    return DonationModel
      .find(
        { eventId: req.params.eventId },
        '-updatedAt',
        { skip: page * limit, limit },
      )
      .then((donationDocs) => res
        .status(200)
        .json({
          message: 'Success',
          data: donationDocs,
          count: donationDocs.length,
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

  const viewDonation = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { eventId, donationId } = req.params;

    return DonationModel
      .findOne({ _id: donationId, eventId }, '-updatedAt')
      .then((donationDoc) => {
        if (!donationDoc) {
          const controllerError = new Error('Resource not found');
          controllerError.name = 'NotFoundError';
        }
        return res
          .status(200)
          .json({
            message: 'Success',
            data: donationDoc,
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

  const receiveDonation = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { useraccesspayload: { authId }, origin } = req.headers;
    const { eventId, donationId } = req.params;

    // confirm that event is only accessible to authorized user
    return DonationModel
      .findOne({ _id: donationId, eventId, received: false })
      .populate({
        path: 'eventId',
        select: '_id ngoId',
        populate: {
          path: 'ngoId',
          select: 'authId name',
          match: { authId },
          populate: {
            path: 'authId',
            select: 'email',
          },
        },
      })
      .then(async (donationDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!donationDoc || !donationDoc.eventId) throw controllerError;

        const { eventId: { ngoId }, email: donorEmail } = donationDoc;

        // ensure the event is for the authorized user
        controllerError.message = new Error('Unauthorized request');
        controllerError.name = 'UnauthorizedError';
        if (!donationDoc.eventId.ngoId) throw controllerError;

        const { authId: { email: ngoEmail }, name: ngoName } = donationDoc.eventId.ngoId;

        // flag `received` as true
        await DonationModel.findByIdAndUpdate(donationId, { received: true })
          .catch((err) => { throw err; });

        // flag donation as received for response and notification
        const donationDocRes = donationDoc;
        donationDocRes.received = true;

        const {
          _id, phone, dateTime, pickup, items,
        } = donationDoc;
        const [date, time] = new Date().toJSON().split('T');

        const itemParagraphListing = items.map(({
          name, quantity, unit, desc, purpose,
        }) => (`<tr class='ItemList'>
          <td className='ItemName' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${name}</td>
          <td className='ItemDesc' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${desc || ''}</td>
          <td className='ItemQuantity' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px; text-align: right;'>${quantity}</td>
          <td className='ItemQuantityUnit' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${unit}</td>
          <td className='ItemPurpose' style='border: 0.5px solid grey; border-collapse: collapse; padding: 6px;'>${purpose || ''}</td>
        <tr>`)).join('');

        const htmlFooter = `
          <p>
            Thanks,
            <br/>
            The 
            <a href='${origin}' style='font-weight: 700;'>Give To Charity</a> 
            team.
          </p>
        `;

        // notify NGO via email
        {
          const donationHTMLSection = (() => (`<section class='DonationDesc container'>
              <h2>Donation Details</h2>
              <p class='PickupDateTime'>
                <span class='PickupDate' style='margin-right: 3em;'>Reception Date: 
                  <time datetime='${date}' class='badge badge-secondary'>${date}</time>
                </span>
                <span class='PickupTime'>Reception Time:
                  <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time>
                </span>
              </p>
              <div class='DonorContactDetails'>
                <h3>Donor Contact Details</h3>
                <p class='Email' style='margin-right: 3em;'
                  <span class='badge badge-secondary'>Email: </span>
                  <a href='mailto:${donorEmail}' class='badge badge-secondary'>${donorEmail}</a>
                </p>
                <p class='Phone'>
                  <span class='badge badge-secondary'>Phone: </span>
                  <a href='tel:${phone}' class='badge badge-secondary'>${phone}</a>
                </p>
              </div>
              <div class='DonationItemDetails'>
                <h3>Donation Item Details</h3>
                <table style='border: 0.5px solid grey; border-collapse: collapse; color: #232323;'>
                  <tr>
                    <th style='padding: 6px;'>Name</th>
                    <th style='padding: 6px;'>Description</th>
                    <th style='padding: 6px;'>Quantity</th>
                    <th style='padding: 6px;'>Unit</th>
                    <th style='padding: 6px;'>Purpose</th>
                  </tr>
                  ${itemParagraphListing}
                </table>
              </div>
            </section>`))();
          const subject = 'Received Donation';
          const text = 'A new donation has been received on your account';
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br />
                <p>
                  A new donation has been received on your account at ${time} on ${date}.
                  View more details at 
                  <a href='${origin}/ngos/${ngoId._id}/event/${eventId}/donations/${_id}'>
                    ${origin}/ngos/${ngoId._id}/event/${eventId}/donations/${_id}
                  </a>.
                </p>
              </section>
              ${donationHTMLSection}
            </main>
          `;
          const html = htmlWrapper(htmlBody, 'Donation', htmlFooter);
          mailer(ngoEmail, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        // notify donor via email
        {
          const donationHTMLSection = (() => (`<section class='DonationDesc container'>
            <h2>Donation Details</h2>
            <p class='PickupDateTime'>
              <span class='PickupDate' style='margin-right: 3em;'>Reception Date: 
                <time datetime='${date}' class='badge badge-secondary'>${date}</time>
              </span>
              <span class='PickupTime'>Reception Time:
                <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time>
              </span>
            </p>
            <table style='border: 0.5px solid grey; border-collapse: collapse; color: #232323;'>
              <tr>
                <th style='padding: 6px;'>Name</th>
                <th style='padding: 6px;'>Description</th>
                <th style='padding: 6px;'>Quantity</th>
                <th style='padding: 6px;'>Unit</th>
                <th style='padding: 6px;'>Purpose</th>
              </tr>
              ${itemParagraphListing}
            </table>
          </section>`))();
          const [pickupDate, pickupTime] = dateTime.toJSON().split('T');
          const subject = 'Received Donation';
          const text = `Your donation was received at 
            ${time} on ${date} to ${ngoName} which was for pickup on 
            ${pickupDate} by ${pickupTime}${pickup ? ` at ${pickup.address}` : ''}.
          `;
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br />
                <p>
                  Your donation was received at 
                  <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time> 
                  on <time datetime='${date}' class='badge badge-secondary'>${date}</time> 
                  to ${ngoName} for pickup on 
                  <time datetime='${pickupDate}' class='badge badge-secondary'>${pickupDate}</time> 
                  by 
                  <time datetime='${pickupTime.replace('Z', '')}' class='badge badge-secondary'>
                    ${pickupTime}
                  </time>
                  ${pickup ? ` at ${pickup.address}` : ''}.
                  <br />
                  More details are as specified below.
                </p>
              </section>
              ${donationHTMLSection}
            </main>
          `;
          const html = htmlWrapper(htmlBody, 'Received Donation', htmlFooter);
          mailer(donorEmail, subject, text, html)
            .catch((err) => logger.error(err.message));
        }

        donationDocRes.eventId = donationDocRes.eventId._id;

        // send successful response
        return res
          .status(201)
          .json({
            message: 'Donation has been successfuly received officially',
            data: donationDocRes,
          });
      })
      .catch((donationErr) => {
        if (donationErr.code) {
          switch (donationErr.code) {
            case 11000:
              return errResponse(res, 403, 'Duplicate needs');

            default:
              return errResponse(res, 500, null, donationErr);
          }
        }

        switch (donationErr.name) {
          case 'ValidationError':
          case 'NotFoundError':
            return errResponse(res, 400, donationErr.message);

          case 'UnauthorizedError':
            return errResponse(res, 401, donationErr.message);

          default:
            return errResponse(res, 500, null, donationErr);
        }
      });
  };

  return {
    donateItem, listDonations, viewDonation, receiveDonation,
  };
};

module.exports = donationController;
