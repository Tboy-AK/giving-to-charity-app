const { Types } = require('mongoose');
const { id1 } = require('./ngos-data');

const subscriber1Id = Types.ObjectId();
const subscriber2Id = Types.ObjectId();

const subscribersData = [
  {
    _id: subscriber1Id,
    email: 'danfritzby@gmail.com',
    ngos: [id1],
    sdgs: [1, 2, 3, 4],
  },
  {
    _id: subscriber2Id,
    email: 'sanfrancis@gmail.com',
    ngos: [id1],
    sdgs: [1, 2, 3, 4],
    deleted: true,
  },
];

exports.id1 = subscriber1Id;
exports.id2 = subscriber2Id;
exports.data = subscribersData;
exports.count = subscribersData.length;
