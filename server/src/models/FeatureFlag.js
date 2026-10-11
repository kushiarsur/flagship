
const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Flag name is required'],
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
      match: [
        /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/,
        'Use lowercase letters, numbers, underscores or hyphens',
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    environment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    rolloutPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// A flag name must be unique within an environment.
featureFlagSchema.index(
  { environment: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
