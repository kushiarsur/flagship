
const crypto = require('crypto');
const FeatureFlag = require('../models/FeatureFlag');

async function evaluateFlag(req, res, next) {
  try {
    const { flagName } = req.params;
    const userId = req.query.userId;

    if (
      typeof userId !== 'string' ||
      userId.trim().length === 0 ||
      userId.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide a userId query parameter (1–200 characters)',
      });
    }

    const flag = await FeatureFlag.findOne({
      environment: req.environment._id,
      name: flagName.toLowerCase(),
    }).select('name description enabled rolloutPercentage');

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found',
      });
    }

    // Stable bucket from 0 to 99 for this environment, flag and user.
    const hash = crypto
      .createHash('sha256')
      .update(`${req.environment._id}:${flag.name}:${userId}`)
      .digest('hex');

    const bucket = parseInt(hash.slice(0, 8), 16) % 100;

    const enabled =
      flag.enabled === true &&
      bucket < flag.rolloutPercentage;

    return res.status(200).json({
      success: true,
      flag: flag.name,
      userId,
      enabled,
      reason: !flag.enabled
        ? 'FLAG_DISABLED'
        : enabled
          ? 'ROLLOUT_INCLUDED'
          : 'ROLLOUT_EXCLUDED',
      rolloutPercentage: flag.rolloutPercentage,
      bucket,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { evaluateFlag };
