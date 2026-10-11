
const crypto = require('crypto');
const mongoose = require('mongoose');
const Environment = require('../models/Environment');
const Project = require('../models/Project');

async function rotateEnvironmentKey(req, res, next) {
  try {
    const { projectId, environmentId } = req.params;

    if (
      !mongoose.isValidObjectId(projectId) ||
      !mongoose.isValidObjectId(environmentId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project or environment ID',
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const environment = await Environment.findOne({
      _id: environmentId,
      project: project._id,
    });

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: 'Environment not found',
      });
    }

    const secret = `fs_${crypto.randomBytes(32).toString('hex')}`;
    const prefix = secret.slice(0, 11);
    const hash = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');

    environment.apiKeyPrefix = prefix;
    environment.apiKeyHash = hash;
    await environment.save();

    return res.status(200).json({
      success: true,
      message: 'API key rotated successfully. Save it securely; it will not be shown again.',
      environment: environment.name,
      apiKey: secret,
      apiKeyPrefix: prefix,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { rotateEnvironmentKey };
