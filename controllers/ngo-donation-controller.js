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
    reqBody.logistics = req.query.logistics;
    reqBody.ngoId = req.params.ngoId;

    // Save donation data to database
    const donationModel = new DonationModel(reqBody);
    return donationModel.save()
      .then(async (donationDoc) => {
        if (!donationDoc) throw new Error('Internal server error');

        const ngoDoc = await NGOModel
          .findById(req.params.ngoId, '_id name')
          .populate('authId', 'email');
        const reqErr = new Error('Resource not found');
        reqErr.code = 404;
        if (!ngoDoc) throw reqErr;

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
            <a href='${origin}' style='background-color: gray;'>Give To Charity</a> 
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
              <p class='Email' style='margin-right: 3em;'
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
                  <th style='padding: 6px;'>Name</th>
                  <th style='padding: 6px;'>Description</th>
                  <th style='padding: 6px;'>Quantity</th>
                  <th style='padding: 6px;'>Unit</th>
                  <th style='padding: 6px;'>Purpose</th>
                </tr>
                ${itemParagraphListing}
              </table>
            </div>
          </section>`);
          })();
          const [date, time] = donationDoc.createdAt.toJSON().split('T');
          const { email } = ngoDoc.authId;
          const subject = 'New Donation';
          const text = 'A new donation has been made to your account';
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br/>
                <p>
                  A new donation has been made to your account at ${time} on ${date}.
                  View more details at 
                  <a href='${origin}/ngos/${donationDoc.ngoId}/donations/${donationDoc._id}'>
                    ${origin}/ngos/${donationDoc.ngoId}/donations/${donationDoc._id}
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
          const text = `You subscribed to a new donation at ${time} on ${date} to ${ngoDoc.name} for pickup on ${pickupDate} by ${pickupTime}${
            pickup ? ` at ${pickup.address}` : ''
          }.`;
          const htmlBody = `
            <main class='container'>
              <section class='Intro container'>
                <p>Hi there,</p>
                <br/>
                <p>
                  You subscribed to a new donation at 
                  <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time> 
                  on <time datetime='${date}' class='badge badge-secondary'>${date}</time> 
                  to ${ngoDoc.name} for pickup on 
                  <time datetime='${pickupDate}' class='badge badge-secondary'>${pickupDate}</time> 
                  by <time datetime='${pickupTime.replace('Z', '')}' class='badge badge-secondary'>${pickupTime}</time>
                  ${pickup ? ` at ${pickup.address}` : ''}.
                  <br />
                  More details are as specified below.
                </p>
              </section>
              ${donationHTMLSection}
            </main>
          `;
          const html = htmlWrapper(htmlBody, 'New Donation', htmlFooter);
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
              return errResponse(res, 400, 'Resource already exists');

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
        { ngoId: req.params.ngoId },
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

    const { ngoId, donationId } = req.params;

    return DonationModel
      .findOne({ _id: donationId, ngoId }, '-updatedAt')
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

    const { authId } = req.headers.useraccesspayload;
    const { ngoId, donationId } = req.params;

    // confirm that event is only accessible to authorized user
    return DonationModel.findOne({ _id: donationId, ngoId })
      .populate('ngoId', 'authId', { authId })
      .then(async (donationDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!donationDoc) throw controllerError;
        if (!donationDoc.ngoId) {
          controllerError.message = 'Unauthorized access';
          controllerError.name = 'UnauthorizedError';
          throw controllerError;
        }

        // flag received as true
        await DonationModel.findByIdAndUpdate(donationId, { received: true })
          .catch((err) => { throw err; });

        // flag donation as received for response
        const donationDocRes = donationDoc;
        donationDocRes.received = true;

        NGOModel
          .findById(donationDoc.ngoId._id)
          .populate('authId', 'email')
          .then((ngoDoc) => {
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
                <a href='${origin}' style='background-color: gray;'>Give To Charity</a> 
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
                    <p class='Email' style='margin-right: 3em;'
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
                        <th style='padding: 6px;'>Name</th>
                        <th style='padding: 6px;'>Description</th>
                        <th style='padding: 6px;'>Quantity</th>
                        <th style='padding: 6px;'>Unit</th>
                        <th style='padding: 6px;'>Purpose</th>
                      </tr>
                      ${itemParagraphListing}
                    </table>
                  </div>
                </section>`);
              })();
              const [date, time] = donationDoc.createdAt.toJSON().split('T');
              const { email } = ngoDoc.authId;
              const subject = 'New Donation';
              const text = 'A new donation has been made to your account';
              const htmlBody = `
                <main class='container'>
                  <section class='Intro container'>
                    <p>Hi there,</p>
                    <br/>
                    <p>
                      A new donation has been made to your account at ${time} on ${date}.
                      View more details at 
                      <a href='${origin}/ngos/${ngoDoc}/donations/${donationDoc._id}'>
                        ${origin}/ngos/${ngoDoc}/donations/${donationDoc._id}
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
              const { email } = donationDoc;
              const subject = 'New Donation';
              const text = `You subscribed to a new donation at 
                ${time} on ${date} to ${ngoDoc.name} for pickup on ${pickupDate} by 
                ${pickupTime}${pickup ? ` at ${pickup.address}` : ''}.`;
              const htmlBody = `
                <main class='container'>
                  <section class='Intro container'>
                    <p>Hi there,</p>
                    <br/>
                    <p>
                      You subscribed to a new donation at 
                      <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time> 
                      on <time datetime='${date}' class='badge badge-secondary'>${date}</time> 
                      to ${ngoDoc.name} for pickup on 
                      <time datetime='${pickupDate}' class='badge badge-secondary'>${pickupDate}</time> 
                      by <time datetime='${pickupTime.replace('Z', '')}' class='badge badge-secondary'>${pickupTime}</time>
                      ${pickup ? ` at ${pickup.address}` : ''}.
                      <br />
                      More details are as specified below.
                    </p>
                  </section>
                  ${donationHTMLSection}
                </main>
              `;
              const html = htmlWrapper(htmlBody, 'New Donation', htmlFooter);
              mailer(email, subject, text, html)
                .catch((err) => logger.error(err.message));
            }
          })
          .catch((err) => logger.error(err.message));

        // send successful response
        return res
          .status(201)
          .json({
            message: 'Donation has been officially received successfuly',
            count: donationDocRes.length,
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
