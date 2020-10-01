/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const logger = require('../utils/winston-logger');
const mailer = require('../utils/email-handler');
const htmlWrapper = require('../utils/html-wrapper');

const subcriberRegController = (errResponse, SubscriberModel, EventModel, NGOModel) => {
  const createSubscriber = (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // get request data for utilization purposes
    const reqBody = { ...req.body };

    // save subscriber data to database
    const newSubscriber = new SubscriberModel(reqBody);
    return newSubscriber.save()
      .then(async () => {
        // Get related resources

        const { sdgs, ngos: ngoIds } = reqBody;
        const ngoEvents = [];

        if (sdgs && sdgs.length > 0) {
        // Get list of NGOs by the specified SDGs
          const ngosByRequestSDGs = await NGOModel
            .find(
              { sdgs: { $in: sdgs } },
              '_id name ngoId desc sdgs address website needs',
            );

          if (ngosByRequestSDGs && ngosByRequestSDGs.length > 0) {
            // Get IDs of a list of NGOs by their SDGs
            // This would be used to get their upcoming events
            const ngoIdsBySDG = ngosByRequestSDGs.map(({ _id }) => _id);

            // Get list of events by the list of NGOs based on the specified SDGs
            const ngoEventsByNGOs = await EventModel
              .find(
                {
                  ngoId: { $in: ngoIdsBySDG },
                  sdg: { $nin: sdgs },
                },
                '_id name ngoId desc sdg dateTime venue website needs',
              )
              .where('dateTime').gt(Date.now())
              .limit(10)
              .populate('ngoId', 'name');

            if (ngoEventsByNGOs && ngoEventsByNGOs.length > 0) ngoEvents.push(ngoEventsByNGOs);
          }

          // Get list of events by the list of SDGs specified by the user
          const ngoEventsBySDG = await EventModel
            .find(
              { sdg: { $in: sdgs } },
              '_id name desc sdg dateTime venue website needs',
            )
            .where('dateTime').gt(Date.now())
            .limit(10)
            .populate('ngoId', 'name');

          if (ngoEventsBySDG && ngoEventsBySDG.length > 0) ngoEvents.push(ngoEventsBySDG);
        }

        if (ngoIds && ngoIds.length > 0) {
        // Get list of events by the list of NGOs specified by the user
          const ngoEventsByRequestNGOs = await EventModel
            .find(
              { ngoId: { $in: ngoIds } },
              '_id name ngoId desc sdg dateTime venue website needs',
            )
            .where('dateTime').gt(Date.now())
            .limit(10)
            .populate('ngoId', 'name');

          if (
            ngoEventsByRequestNGOs && ngoEventsByRequestNGOs.length > 0
          ) ngoEvents.push(ngoEventsByRequestNGOs);
        }

        // Send email notification to the new subscriber
        const domain = `https://${process.env.DOMAIN}`;

        const eventHTMLArticles = ngoEvents.map((ngoEvent) => ngoEvent
          .map(({
            _id, ngoId, desc, name, dateTime,
          }) => {
            const [date, time] = dateTime.toJSON().split('T');
            return (`<article class='card'>
              <div class='card-body'>
                <h5 class='card-title'>${name}</h5>
                <h6 class='card-subtitle mb-2 text-muted'>
                  <time datetime='${date}' class='badge badge-secondary' style='margin-right: 3em;'>${date}</time>
                  <time datetime='${time.replace('Z', '')}' class='badge badge-secondary'>${time}</time>
                </h6>
                <p><a href='${domain}/ngos/${ngoId._id}/events/${_id}' class='card-link'>
                  ${domain}/ngos/${ngoId._id}/events/${_id}
                </a></p>
                <p class='card-text'>${desc}</p>
              </div>
            </article>`);
          }).join('')).join('');
        const htmlFooter = `
          <p>
            Cheers,
            <br/>
            The 
            <span style='background-color: gray;'> Give To Charity</span>
            team.
          </p>
        `;

        const { email } = reqBody;
        const subject = 'Latest Charity Subscriber';
        const text = 'Guess who\'s our latest subscriber!';
        const htmlBody = `
          <main class='container'>
            <section class='Intro container'>
              <p>
                Dear Subscriber,
              </p>
              <br/>
              <p>
                Congratulations! You can now receive unhindered updates on activities regarding your choice interests as indicated on our website at 
                <a href='${domain}#subscribe'>
                  Give To Charity
                </a>.
              </p>
            </section>
            ${ngoEvents.length > 0 ? `<section class='News container'>
              <section class='Events container'>
                <h2>
                  Below are some news you may be interested in
                </h2>
                ${eventHTMLArticles}
              </section>
            </section>` : ''}
          </main>
        `;
        const html = htmlWrapper(htmlBody, 'Subscription', htmlFooter);
        mailer(email, subject, text, html)
          .catch((err) => logger.error(err.message));

        return res
          .status(201)
          .json({
            message: `Your subscription has been confirmed.
            You will now have access to updates on your specified interests at ${email}.
            This does not prevent you from adding more things that interest you here`,
          });
      })
      .catch((err) => {
        if (err.code) {
          switch (err.code) {
            case 11000:
              return errResponse(res, 400, 'You\'re already a subscriber to this platform');

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

  return { createSubscriber };
};

module.exports = subcriberRegController;
