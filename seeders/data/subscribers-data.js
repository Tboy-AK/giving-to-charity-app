const { Types } = require('mongoose');
const { id1 } = require('./ngos-data');

const subscriber1Id = Types.ObjectId();

const subscribersData = [
  {
    _id: subscriber1Id,
    email: 'danfritzby@gmail.com',
    ngos: [id1],
    sdgs: [1, 2, 3, 4],
  },
];

exports.id1 = subscriber1Id;
exports.data = subscribersData;
exports.count = subscribersData.length;
