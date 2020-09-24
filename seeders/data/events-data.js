const { Types } = require('mongoose');
const { id1 } = require('./ngos-data');

const event1Id = Types.ObjectId();

const eventsData = [
  {
    _id: event1Id,
    ngoId: id1,
    name: 'Test Event 1.0',
    dateTime: '2020-12-30',
    desc: 'This is a test event versioned as 1.0 because it is the first of its kind',
    mission: 'To promote the seamless testing of this app',
    vision: 'A well tested API without unnecessary future stress',
    website: 'https://give-to-charity.herokuapp.com',
    sdg: 1,
    onlinePlatforms: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/NazaAgape',
      },
    ],
    socialMedia: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/NazaAgape',
      },
    ],
    venue: {
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Agege',
      zipCode: 100283,
      address: 'Agege Stadium',
    },
    needs: [
      {
        name: 'Notebooks',
      },
    ],
  },
];

exports.id1 = event1Id;
exports.data = eventsData;
exports.count = eventsData.length;
