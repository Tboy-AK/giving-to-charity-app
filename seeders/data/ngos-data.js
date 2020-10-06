const { Types } = require('mongoose');
const { id1, id2 } = require('./ngo-auths-data');

const ngo1Id = Types.ObjectId();
const ngo2Id = Types.ObjectId();

const ngosData = [
  {
    _id: ngo1Id,
    authId: id1,
    name: 'Child Dreams Foundation',
    mission: 'To promote the creativity in children all around the world',
    vision: 'A world where everyone is appreciated and can contribute to world wellness effectively and actively',
    website: 'https://childdreamsfoundation.com',
    cacNumber: '100283',
    sdgs: [1, 2, 3, 4],
    socialMedia: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/childdreamsfoundation',
      },
    ],
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Agege',
    zipCode: 100283,
    address: 'Agege Stadium, off Agege Local Govt., Agege-Ogba, Lagos.',
    needs: [
      {
        name: 'Notebooks',
      },
      {
        name: 'Pens',
      },
    ],
    verified: true,
  },
  {
    _id: ngo2Id,
    authId: id2,
    name: 'Oyok Foundation',
    mission: 'To promote the culture of giving freely with compassion at heart',
    vision: 'A world where we don\'t look down on people for their shortcomings',
    website: 'https://oyokfoundation.com',
    cacNumber: '100283',
    sdgs: [10, 12, 13, 14],
    socialMedia: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/oyokfoundation',
      },
    ],
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Ajah',
    zipCode: 101245,
    address: 'Lawn Estate, Lekki-Ajah, Lagos.',
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
