const { Types } = require('mongoose');
const { id1 } = require('./ngos-data');

const event1Id = Types.ObjectId();

const eventsData = [
  {
    _id: event1Id,
    ngoId: id1,
    name: 'Child Dream Tech Power Camp 1.0',
    dateTime: '2021-04-30',
    desc: 'This is a test event versioned as 1.0 because it is the first of its kind',
    mission: 'To promote the seamless testing of this app',
    vision: 'A well tested API without unnecessary future stress',
    website: 'https://childdreamsfoundation.com/techpowercamp',
    sdg: 1,
    onlinePlatforms: [
      {
        name: 'Zoom',
        url: 'https://zoom.us/j/92880776910?pwd=NXZmRGlkUVVCZUo1NjRkaDhXaVh2dz09',
      },
    ],
    socialMedia: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/childdreamsfoundation',
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
