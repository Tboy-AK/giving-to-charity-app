const { Types } = require('mongoose');
const { id1: ngoId } = require('./ngos-data');
const { id1: eventId } = require('./events-data');

const donation1Id = Types.ObjectId();
const donation2Id = Types.ObjectId();

const donationsData = [
  {
    _id: donation1Id,
    eventId,
    items: [{
      name: 'Pencil',
      desc: 'A pack of HB pencils',
    }],
    email: 'danarey@gmail.com',
    phone: '+2348012345610',
    dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
    logistics: 'donor',
  },
  {
    _id: donation2Id,
    ngoId,
    items: [{
      name: 'Notebooks',
      desc: 'Hardcopy, 200 page notebooks',
    }],
    email: 'danarey@gmail.com',
    phone: '+2348012345610',
    dateTime: new Date(Date.now() + (3600000 * 24)).toJSON(),
    logistics: 'ngo',
    pickup: {
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      street: 'Fela Shrine street',
      address: 'The Memorable Gathering, Alausa, Ikeja, Lagos.',
      landmark: 'Fela Shrine',
    },
  },
];

exports.id1 = donation1Id;
exports.id1 = donation2Id;
exports.data = donationsData;
exports.count = donationsData.length;
