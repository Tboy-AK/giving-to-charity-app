/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');

const ngoNeeds = (errResponse, EventModel) => {
  const addNeeds = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { authId } = req.headers.useraccesspayload;
    const { ngoId, eventId } = req.params;

    // confirm that event is only accessible to authorized user
    return EventModel.findOne({ _id: eventId, ngoId }, 'ngoId')
      .populate('ngoId', 'authId', { authId })
      .then(async (eventDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!eventDoc) throw controllerError;
        if (!eventDoc.ngoId) {
          controllerError.message = 'Unauthorized access';
          controllerError.name = 'UnauthorizedError';
          throw controllerError;
        }

        // add to list of needs
        await EventModel.findByIdAndUpdate(
          eventId,
          { $addToSet: { needs: { $each: req.body } } },
        ).catch((err) => { throw err; });

        // get updated list of needs
        const eventNeedDoc = await EventModel.findById(eventDoc._id, 'needs')
          .catch((err) => { throw err; });

        if (!eventNeedDoc) {
          controllerError.message = 'Resource not found';
          controllerError.name = 'NotFoundError';
          throw controllerError;
        }

        // send successful response
        return res
          .status(201)
          .json({
            message: 'Itemised needs added successfully',
            count: eventNeedDoc.needs.length,
            data: eventNeedDoc.needs,
          });
      })
      .catch((eventErr) => {
        if (eventErr.code) {
          switch (eventErr.code) {
            case 11000:
              return errResponse(res, 403, 'Duplicate needs');

            default:
              return errResponse(res, 500, null, eventErr);
          }
        }

        switch (eventErr.name) {
          case 'ValidationError':
          case 'NotFoundError':
            return errResponse(res, 400, eventErr.message);

          case 'UnauthorizedError':
            return errResponse(res, 401, eventErr.message);

          default:
            return errResponse(res, 500, null, eventErr);
        }
      });
  };

  const removeNeed = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { authId } = req.headers.useraccesspayload;
    const { ngoId, eventId } = req.params;

    // confirm that event is only accessible to authorized user
    return EventModel.findOne({ _id: eventId, ngoId }, 'ngoId')
      .populate('ngoId', 'authId', { authId })
      .then(async (eventDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!eventDoc) throw controllerError;
        if (!eventDoc.ngoId) {
          controllerError.message = 'Unauthorized access';
          controllerError.name = 'UnauthorizedError';
          throw controllerError;
        }

        // add to list of needs
        await EventModel.findByIdAndUpdate(
          eventId,
          { $pull: { needs: req.body } },
        ).catch((err) => { throw err; });

        // get updated list of needs
        const eventNeedDoc = await EventModel.findById(eventDoc._id, 'needs')
          .catch((err) => { throw err; });

        if (!eventNeedDoc) {
          controllerError.message = 'Resource not found';
          controllerError.name = 'NotFoundError';
          throw controllerError;
        }

        // send successful response
        return res
          .status(200)
          .json({
            message: 'Itemised need has been removed successfully',
            count: eventNeedDoc.needs.length,
            data: eventNeedDoc.needs,
          });
      })
      .catch((eventErr) => {
        if (eventErr.code) {
          switch (eventErr.code) {
            case 11000:
              return errResponse(res, 403, 'Duplicate needs');

            default:
              return errResponse(res, 500, null, eventErr);
          }
        }

        switch (eventErr.name) {
          case 'ValidationError':
          case 'NotFoundError':
            return errResponse(res, 400, eventErr.message);

          case 'UnauthorizedError':
            return errResponse(res, 401, eventErr.message);

          default:
            return errResponse(res, 500, null, eventErr);
        }
      });
  };

  return { addNeeds, removeNeed };
};

module.exports = ngoNeeds;
