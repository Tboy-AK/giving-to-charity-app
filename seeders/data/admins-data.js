const { Types } = require('mongoose');
const { id1 } = require('./admin-auths-data');

const admin1Id = Types.ObjectId();

const adminsData = [
  {
    _id: admin1Id,
    authId: id1,
    firstName: 'adminseeder@gmail.com',
    lastName: '+2348012345678',
  },
];

exports.id1 = admin1Id;
exports.data = adminsData;
exports.count = adminsData.length;
