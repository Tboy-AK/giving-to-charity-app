const { mongoose } = require('../../configs/mongodb-config');

const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 100,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 30,
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
    enum: ['superAdmin', 'admin', 'ngo'],
  },
  activated: {
    type: Boolean,
    default: false,
    required: true,
    select: false,
  },
  suspended: {
    type: Boolean,
    default: false,
    required: true,
    select: false,
  },
}, { timestamps: true });

AuthSchema.virtual('authAdmin', {
  ref: 'Admin',
  localField: '_id',
  foreignField: 'authId',
  justOne: true,
});

AuthSchema.virtual('authNGO', {
  ref: 'NGO',
  localField: '_id',
  foreignField: 'authId',
  justOne: true,
});

const AuthModel = mongoose.model('Auth', AuthSchema);

module.exports = AuthModel;
