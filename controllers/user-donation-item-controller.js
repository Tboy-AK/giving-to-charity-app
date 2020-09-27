/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');

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
      .find({ name: { $in: itemNames } })
      .catch((err) => { errObject = err; });

    if (errObject) return errResponse(res, 500, null, errObject);

    if (
      prohibitedItems && prohibitedItems.length > 0
    ) return errResponse(res, 400, `Prohibited items: ${prohibitedItems.join(', ')}`);

    // Get list of NGOs that need the specified items
    await NGOModel.find(
      { needs: { $elemMatch: { name: { $in: itemNames } } } },
      '_id name ngoId desc sdgs address website needs',
    )
      .then(async (ngosWithNeeds) => {
        if (ngosWithNeeds && ngosWithNeeds.length > 0) {
          // Pass as a donation suggestion
          donationSuggestions.organisations.push(...ngosWithNeeds);
          totalSuggestionsCount += ngosWithNeeds.length;

          // Get list of events by the suggested NGOs
          const ngoIdsBySDG = ngosWithNeeds.map(({ _id }) => _id);

          await EventModel
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
              if (
                ngoEventsByNGOs && ngoEventsByNGOs.length > 0
              ) {
                donationSuggestions.events.push(...ngoEventsByNGOs);
                totalSuggestionsCount += ngoEventsByNGOs.length;
              }
            })
            .catch((err) => { errObject = err; });
        }
      })
      .catch((err) => { errObject = err; });

    // Get list of events that need the specified items
    await EventModel.find(
      { needs: { $elemMatch: { name: { $in: itemNames } } } },
      '_id name desc sdg dateTime venue website needs',
    )
      .where('dateTime').gt(Date.now())
      .limit(100)
      .populate('ngoId', 'name')
      .then((ngoEventsWithNeeds) => {
        if (
          ngoEventsWithNeeds && ngoEventsWithNeeds.length > 0
        ) {
          donationSuggestions.events.push(...ngoEventsWithNeeds);
          totalSuggestionsCount += ngoEventsWithNeeds.length;
        }
      })
      .catch((err) => { errObject = err; });

    if (errObject) return errResponse(res, 500, null, errObject);

    return res
      .status(200)
      .json({
        message: '',
        data: donationSuggestions,
        count: totalSuggestionsCount,
      });
  };

  return { getSuggestions };
};

module.exports = userDonationController;
