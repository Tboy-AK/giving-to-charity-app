const { Types } = require('mongoose');
const { id1 } = require('./ngo-auths-data');

const ngo1Id = Types.ObjectId();

const ngosData = [
  {
    _id: ngo1Id,
    authId: id1,
    name: 'Test Event 1.0',
    mission: 'To promote the seamless testing of this app',
    vision: 'A well tested API without unnecessary future stress',
    website: 'https://give-to-charity.herokuapp.com',
    cacNumber: '100283',
    sdgs: [1, 2, 3, 4],
    socialMedia: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/NazaAgape',
      },
    ],
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Agege',
    zipCode: 100283,
    address: 'Agege Stadium',
    needs: [
      {
        name: 'Notebooks',
      },
      {
        name: 'Pens',
      },
    ],
    verified: false,
  },
];

exports.id1 = ngo1Id;
exports.data = ngosData;
exports.count = ngosData.length;
