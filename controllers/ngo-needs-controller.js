/* eslint-disable no-underscore-dangle */
const { validationResult } = require('express-validator');

const ngoNeeds = (errResponse, NGOModel) => {
  const addNeeds = async (req, res) => {
    // Validate user request data
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      return errResponse(res, 422, validationError.array({ onlyFirstError: true }));
    }

    const { authId } = req.headers.useraccesspayload;

    return NGOModel.findOneAndUpdate(
      { _id: req.params.ngoId, authId },
      { $addToSet: { needs: { $each: req.body } } },
    )
      .then(async (ngoDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!ngoDoc) throw controllerError;

        const ngoNeedDoc = await NGOModel.findById(ngoDoc._id, 'needs')
          .catch((err) => { throw err; });

        if (!ngoNeedDoc) throw controllerError;

        return res
          .status(201)
          .json({
            message: 'Itemised needs added successfully',
            count: ngoNeedDoc.needs.length,
            data: ngoNeedDoc.needs,
          });
      })
      .catch((ngoErr) => {
        if (ngoErr.code) {
          switch (ngoErr.code) {
            case 11000:
              return errResponse(res, 403, 'Duplicate needs');

            default:
              return errResponse(res, 500, null, ngoErr);
          }
        }

        switch (ngoErr.name) {
          case 'ValidationError':
          case 'NotFoundError':
            return errResponse(res, 400, ngoErr.message);

          default:
            return errResponse(res, 500, null, ngoErr);
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

    return NGOModel.findOneAndUpdate(
      { _id: req.params.ngoId, authId },
      { $pull: { needs: req.body } },
    )
      .then(async (ngoDoc) => {
        const controllerError = new Error('Resource not found');
        controllerError.name = 'NotFoundError';
        if (!ngoDoc) throw controllerError;

        const ngoNeedDoc = await NGOModel.findById(ngoDoc._id, 'needs')
          .catch((err) => { throw err; });

        if (!ngoNeedDoc) throw controllerError;

        return res
          .status(200)
          .json({
            message: 'Itemised need has been removed successfully',
            count: ngoNeedDoc.needs.length,
            data: ngoNeedDoc.needs,
          });
      })
      .catch((ngoErr) => {
        if (ngoErr.code) {
          switch (ngoErr.code) {
            case 11000:
              return errResponse(res, 403, 'Duplicate needs');

            default:
              return errResponse(res, 500, null, ngoErr);
          }
        }

        switch (ngoErr.name) {
          case 'ValidationError':
          case 'NotFoundError':
            return errResponse(res, 400, ngoErr.message);

          default:
            return errResponse(res, 500, null, ngoErr);
        }
      });
  };

  return { addNeeds, removeNeed };
};

module.exports = ngoNeeds;
