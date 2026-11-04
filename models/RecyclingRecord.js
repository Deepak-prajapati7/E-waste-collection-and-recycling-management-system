const mongoose = require('mongoose');

const recoveredMaterialSchema = new mongoose.Schema(
  {
    materialName: {
      type: String,
      required: true,
      trim: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const recyclingRecordSchema = new mongoose.Schema(
  {
    collectionRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecyclingCenter',
    },
    processedDate: {
      type: Date,
      default: Date.now,
    },
    totalWeightKg: {
      type: Number,
      required: true,
      default: 0,
    },
    recycledWeightKg: {
      type: Number,
      required: true,
      default: 0,
    },
    disposedWeightKg: {
      type: Number,
      default: 0,
    },
    outcome: {
      type: String,
      default: 'Materials recovered and hazardous residues safely treated',
    },
    recoveredMaterials: [recoveredMaterialSchema],
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

module.exports = mongoose.model('RecyclingRecord', recyclingRecordSchema);

