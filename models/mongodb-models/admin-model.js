const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const AdminSchema = new Schema({
  authId: {
    type: Schema.Types.ObjectId,
    ref: 'Auths',
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
  },
}, { timestamps: true });
const AdminModel = mongoose.model('Admin', AdminSchema);

module.exports = AdminModel;