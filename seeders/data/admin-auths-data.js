const { genSaltSync, hashSync } = require('bcryptjs');
const { Types } = require('mongoose');

const adminAuth1Id = Types.ObjectId();

const adminAuthsData = [
  {
    _id: adminAuth1Id,
    email: 'adminseeder@gmail.com',
    phone: '+2348012345678',
    password: 'Password1234',
    role: 'admin',
  },
];

const salt = genSaltSync(10);
adminAuthsData.forEach((e) => {
  const hashString = hashSync(e.password, salt);
  e.password = hashString;
});

exports.id1 = adminAuth1Id;
exports.data = adminAuthsData;
exports.count = adminAuthsData.length;
