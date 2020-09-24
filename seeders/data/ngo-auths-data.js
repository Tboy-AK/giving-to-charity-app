const { genSaltSync, hashSync } = require('bcryptjs');
const { Types } = require('mongoose');

const ngoAuth1Id = Types.ObjectId();

const ngoAuthsData = [
  {
    _id: ngoAuth1Id,
    email: 'childdreamsfoundation@gmail.com',
    phone: '+2348012345679',
    password: 'Password1234',
    role: 'ngo',
  },
];

const salt = genSaltSync(10);
ngoAuthsData.forEach((e) => {
  const hashString = hashSync(e.password, salt);
  e.password = hashString;
});

exports.id1 = ngoAuth1Id;
exports.data = ngoAuthsData;
exports.count = ngoAuthsData.length;
