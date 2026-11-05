const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Approved',
        'Scheduled',
        'Collected',
        'Processing',
        'Completed',
        'Rejected',
        'Cancelled',
      ],
    },
    at: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const collectionRequestSchema = new mongoose.Schema(
  {
    numericId: {
      type: Number,
      unique: true,
      index: true,
    },
    user: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      required: [true, 'Waste category is required'],
      trim: true,
    },
    method: {
      type: String,
      enum: ['Pickup', 'Drop-off'],
      default: 'Pickup',
    },
    qty: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99'],
    },
    date: {
      type: String,
      required: [true, 'Collection date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location or address is required'],
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Scheduled',
        'Collected',
        'Processing',
        'Completed',
        'Rejected',
        'Cancelled',
      ],
      default: 'Pending',
      index: true,
    },
    estimatedWeight: {
      type: Number,
      default: 0,
    },
    actualWeight: {
      type: Number,
      default: null,
    },
    history: [historySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.numericId || ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to ensure numericId is set if not provided
collectionRequestSchema.pre('save', function (next) {
  if (!this.numericId) {
    this.numericId = Date.now();
  }
  if (!this.history || this.history.length === 0) {
    this.history = [
      {
        status: this.status || 'Pending',
        at: new Date(),
        by: this.user || 'System',
      },
    ];
  }
  next();
});

module.exports = mongoose.model('CollectionRequest', collectionRequestSchema);

