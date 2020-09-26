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

    const donationSuggestions = [];

    // Check for prohibited items in user's request
    const prohibitedItems = await ProhibitedDonationItemModel
      .find({ sdgs: { $in: itemNames } }, 'name')
      .catch((err) => errResponse(res, 500, null, err));

    if (
      prohibitedItems && prohibitedItems.length > 0
    ) return errResponse(res, 400, `Prohibited items: ${prohibitedItems.join(', ')}`);

    // Get list of NGOs that need the specified items
    NGOModel.find(
      { needs: { $in: itemNames } },
      '_id name ngoId desc sdgs address website needs',
    )
      .then(async (ngosWithNeeds) => {
        if (ngosWithNeeds && ngosWithNeeds.length > 0) {
          // Pass as a donation suggestion
          donationSuggestions.push(ngosWithNeeds);

          // Get list of events by the suggested NGOs
          const ngoIdsBySDG = ngosWithNeeds.map(({ _id }) => _id);

          const ngoEventsByNGOs = await EventModel
            .find(
              { ngoId: { $in: ngoIdsBySDG } },
              '_id name ngoId desc sdg dateTime venue website needs',
            )
            .where('dateTime').gt(Date.now())
            .limit(100)
            .populate('ngoId', 'name');

          if (
            ngoEventsByNGOs && ngoEventsByNGOs.length > 0
          ) donationSuggestions.push(ngoEventsByNGOs);
        }
      });

    // Get list of events that need the specified items
    const ngoEventsBySDG = await EventModel.find(
      {
        needs: { $in: itemNames },
      },
      '_id name desc sdg dateTime venue website needs',
    )
      .where('dateTime').gt(Date.now())
      .limit(100)
      .populate('ngoId', 'name');

    if (
      ngoEventsBySDG && ngoEventsBySDG.length > 0
    ) donationSuggestions.push(ngoEventsBySDG);

    return res
      .status(200)
      .json({
        message: '',
        data: donationSuggestions,
        count: donationSuggestions.length,
      });
  };

  return { getSuggestions };
};

module.exports = userDonationController;
