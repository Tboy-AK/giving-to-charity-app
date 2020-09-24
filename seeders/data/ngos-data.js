const { Types } = require('mongoose');
const { id1 } = require('./ngo-auths-data');

const ngo1Id = Types.ObjectId();

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
    verified: false,
  },
];

exports.id1 = ngo1Id;
exports.data = ngosData;
exports.count = ngosData.length;
