const mongoose = require('mongoose');

const wasteCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    desc: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    avgWeightPerUnit: {
      type: Number,
      default: 2.5, // in kg
    },
    carbonOffsetPerKg: {
      type: Number,
      default: 1.4, // kg CO2 saved per kg recycled
    },
    preciousMetals: {
      type: [String],
      default: ['Copper', 'Aluminum', 'Gold traces', 'Circuit Silicon'],
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

module.exports = mongoose.model('WasteCategory', wasteCategorySchema);

