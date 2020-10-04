/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');

const eventController = (errResponse, EventModel) => {
  const listEvents = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { page, limit, ngoId } = req.query;

    if (ngoId) {
      return EventModel
        .find(
          { ngoId: req.query.ngoId, dateTime: { $gt: new Date() } },
          '-updatedAt',
          { sort: { dateTime: 1 }, skip: page * limit, limit },
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
    }

    return EventModel
      .find(
        { dateTime: { $gt: new Date() } },
        '-updatedAt',
        { sort: { dateTime: 1 }, skip: page * limit, limit },
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

    const { eventId } = req.params;

    return EventModel
      .findOne({ _id: eventId, dateTime: { $gt: new Date() } }, '-updatedAt')
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
            data: eventDoc,
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

  return { listEvents, viewEvent };
};

module.exports = eventController;
