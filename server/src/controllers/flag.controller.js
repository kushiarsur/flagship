
const mongoose = require('mongoose');
const FeatureFlag = require('../models/FeatureFlag');
const Project = require('../models/Project');
const Environment = require('../models/Environment');

async function createFlag(req, res, next) {
  try {
    const { projectId, environmentId } = req.params;
    const { name, description = '', enabled = false, rolloutPercentage = 100 } =
      req.validated.body;

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
        message: 'Environment not found in this project',
      });
    }

    const flag = await FeatureFlag.create({
      name,
      description,
      enabled,
      rolloutPercentage,
      project: project._id,
      environment: environment._id,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Feature flag created successfully',
      flag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A flag with this name already exists in this environment',
      });
    }

    next(error);
  }
}

async function getFlags(req, res, next) {
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
        message: 'Environment not found in this project',
      });
    }

    const flags = await FeatureFlag.find({
      project: project._id,
      environment: environment._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: flags.length,
      flags,
    });
  } catch (error) {
    next(error);
  }
}

async function updateFlag(req, res, next) {
  try {
    const { projectId, environmentId, flagId } = req.params;

    if (
      !mongoose.isValidObjectId(projectId) ||
      !mongoose.isValidObjectId(environmentId) ||
      !mongoose.isValidObjectId(flagId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project, environment or flag ID',
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
        message: 'Environment not found in this project',
      });
    }

    const flag = await FeatureFlag.findOne({
      _id: flagId,
      project: project._id,
      environment: environment._id,
    });

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found',
      });
    }

    Object.assign(flag, req.validated.body);
    await flag.save();

    return res.status(200).json({
      success: true,
      message: 'Feature flag updated successfully',
      flag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A flag with this name already exists in this environment',
      });
    }

    next(error);
  }
}

async function deleteFlag(req, res, next) {
  try {
    const { projectId, environmentId, flagId } = req.params;

    if (
      !mongoose.isValidObjectId(projectId) ||
      !mongoose.isValidObjectId(environmentId) ||
      !mongoose.isValidObjectId(flagId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project, environment or flag ID',
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

    const flag = await FeatureFlag.findOneAndDelete({
      _id: flagId,
      project: project._id,
      environment: environmentId,
    });

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feature flag deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlag,
  getFlags,
  updateFlag,
  deleteFlag,
};
