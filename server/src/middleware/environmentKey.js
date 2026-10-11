
const crypto = require('crypto');
const Environment = require('../models/Environment');

async function environmentKey(req, res, next) {
  try {
    const apiKey = req.get('x-api-key');

    if (!apiKey || !apiKey.startsWith('fs_')) {
      return res.status(401).json({
        success: false,
        message: 'Environment API key required in x-api-key header',
      });
    }

    const prefix = apiKey.slice(0, 11);

    const environment = await Environment.findOne({
      apiKeyPrefix: prefix,
    }).select('+apiKeyHash');

    if (!environment) {
      return res.status(401).json({
        success: false,
        message: 'Invalid environment API key',
      });
    }

    const suppliedHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest();

    const storedHash = Buffer.from(environment.apiKeyHash, 'hex');

    if (
      storedHash.length !== suppliedHash.length ||
      !crypto.timingSafeEqual(storedHash, suppliedHash)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid environment API key',
      });
    }

    req.environment = environment;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = environmentKey;
