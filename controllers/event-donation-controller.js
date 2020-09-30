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

        const domain = `https://${process.env.DOMAIN}`;

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
                  <a href='${domain}/ngos/${eventDoc.ngoId._id}/events/${donationDoc.eventId}/donations/${donationDoc._id}'>
                    ${domain}/ngos/${eventDoc.ngoId._id}/events/${donationDoc.eventId}/donations/${donationDoc._id}
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

  return { donateItem };
};

module.exports = donationController;
