
const mongoose = require('mongoose');
const crypto = require('crypto');

const environmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['development', 'staging', 'production'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    apiKeyPrefix: {
      type: String,
      required: true,
      unique: true,
    },
    apiKeyHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

environmentSchema.statics.generateApiKey = function () {
  const secret = `fs_${crypto.randomBytes(32).toString('hex')}`;

  return {
    secret,
    prefix: secret.slice(0, 11),
    hash: crypto.createHash('sha256').update(secret).digest('hex'),
  };
};

module.exports = mongoose.model('Environment', environmentSchema);
