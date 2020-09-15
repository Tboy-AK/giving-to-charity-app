const { mongoose } = require('../../configs/mongodb-config');

const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    trim: ' ',
  },
  password: {
    type: String,
    required: true,
    minlength: 12,
  },
  role: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['admin', 'ngo'],
  },
}, { timestamps: true });
const AuthModel = mongoose.model('Auth', AuthSchema);

module.exports = AuthModel;
