const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Jaipur',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    verifiedPartner: {
      type: Boolean,
      default: true,
    },
    acceptedCategories: {
      type: [String],
      default: ['Computers', 'Mobile phones', 'Batteries', 'Televisions', 'Printers', 'Cables'],
    },
    openingHours: {
      type: String,
      default: 'Mon - Sat: 9:00 AM - 6:00 PM',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);

