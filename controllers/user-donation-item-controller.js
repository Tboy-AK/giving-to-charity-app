/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');
const events = require('events');

const userDonationController = (errResponse, ProhibitedDonationItemModel, EventModel, NGOModel) => {
  const getSuggestions = async (req, res) => {
    // validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError
        .array({ onlyFirstError: true }));
    }

    // get request data for utilization purposes
    const reqBody = [...req.body];

    const itemNames = reqBody.map(({ name }) => name);

    const donationSuggestions = { organisations: [], events: [] };
    let totalSuggestionsCount = 0;
    let errObject;

    // Check for prohibited items in user's request
    const prohibitedItems = await ProhibitedDonationItemModel
      .find({ name: { $in: itemNames } }, '-_id name')
      .catch((err) => { errObject = err; });

    if (errObject) return errResponse(res, 500, null, errObject);

    if (
      prohibitedItems && prohibitedItems.length > 0
    ) {
      const { origin } = req.headers;
      return errResponse(
        res, 400,
        `Prohibited items: ${
          prohibitedItems
            .map((prohibitedItemDoc) => prohibitedItemDoc.name)
            .join(', ')
        }.
        View more at ${origin}/prohibited_items`,
      );
    }

    // Set async response handling
    const controllerProcessEmitter = new events.EventEmitter();
    let processCount = 0;
    const totalProcessCount = 3;
    const finishedResponse = () => {
      if (processCount === totalProcessCount) {
        return res
          .status(200)
          .json({
            message: 'Success',
            data: donationSuggestions,
            count: totalSuggestionsCount,
          });
      }
      return null;
    };
    const erroredResponse = (err) => errResponse(res, 500, null, err);
    controllerProcessEmitter.on('complete', finishedResponse);
    controllerProcessEmitter.on('error', erroredResponse);

    // Get list of NGOs that need the specified items
    NGOModel.find(
      { needs: { $elemMatch: { name: { $in: itemNames } } } },
      '_id name ngoId desc sdgs address website needs',
    )
      .then(async (ngosWithNeeds) => {
        processCount++;

        if (ngosWithNeeds && ngosWithNeeds.length > 0) {
          // Pass as a donation suggestion
          donationSuggestions.organisations.push(...ngosWithNeeds);
          totalSuggestionsCount += ngosWithNeeds.length;

          // Get list of events by the suggested NGOs
          // These events must be events that do not have the specified needs
          // This is to ensure non-duplicate response data for events result
          const ngoIdsBySDG = ngosWithNeeds.map(({ _id }) => _id);

          EventModel
            .find(
              {
                ngoId: { $in: ngoIdsBySDG },
                needs: { $elemMatch: { name: { $nin: itemNames } } },
              },
              '_id name ngoId desc sdg dateTime venue website needs',
            )
            .where('dateTime').gt(Date.now())
            .limit(100)
            .populate('ngoId', 'name')
            .then((ngoEventsByNGOs) => {
              processCount++;
              if (
                ngoEventsByNGOs && ngoEventsByNGOs.length > 0
              ) {
                donationSuggestions.events.push(...ngoEventsByNGOs);
                totalSuggestionsCount += ngoEventsByNGOs.length;
              }
              return controllerProcessEmitter.emit('complete');
            })
            .catch((err) => controllerProcessEmitter.emit('error', err));
        } else {
          processCount++;
          return controllerProcessEmitter.emit('complete');
        }

        return controllerProcessEmitter.emit('complete');
      })
      .catch((err) => controllerProcessEmitter.emit('error', err));

    // Get list of events that need the specified items
    return EventModel.find(
      { needs: { $elemMatch: { name: { $in: itemNames } } } },
      '_id name desc sdg dateTime venue website needs',
    )
      .where('dateTime').gt(Date.now())
      .limit(100)
      .populate('ngoId', 'name')
      .then((ngoEventsWithNeeds) => {
        processCount++;
        if (
          ngoEventsWithNeeds && ngoEventsWithNeeds.length > 0
        ) {
          donationSuggestions.events.push(...ngoEventsWithNeeds);
          totalSuggestionsCount += ngoEventsWithNeeds.length;
        }
        return controllerProcessEmitter.emit('complete');
      })
      .catch((err) => controllerProcessEmitter.emit('error', err));
  };

  return { getSuggestions };
};

module.exports = userDonationController;
