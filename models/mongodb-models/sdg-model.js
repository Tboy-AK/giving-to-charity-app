const { mongoose } = require('../../configs/mongodb-config');

const SDGSchema = new mongoose.Schema({
  _id: {
    type: Number,
    min: 1,
    max: 20,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 100,
  },
  url: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 255,
  },
}, { timestamps: true });
const SDGModel = mongoose.model('SDG', SDGSchema);

module.exports = SDGModel;
