
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Environment = require('../models/Environment');

const ENVIRONMENT_NAMES = ['development', 'staging', 'production'];

async function createProject(req, res, next) {
  try {
    const { name, description = '' } = req.validated.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
    });

    const createdEnvironments = [];
    const returnedKeys = [];

    try {
      for (const environmentName of ENVIRONMENT_NAMES) {
        const key = Environment.generateApiKey();

        const environment = await Environment.create({
          name: environmentName,
          project: project._id,
          apiKeyPrefix: key.prefix,
          apiKeyHash: key.hash,
        });

        createdEnvironments.push(environment);
        returnedKeys.push({
          environment: environment.name,
          apiKey: key.secret,
          apiKeyPrefix: key.prefix,
        });
      }

      project.environments = createdEnvironments.map((env) => env._id);
      await project.save();
    } catch (error) {
      await Environment.deleteMany({ project: project._id });
      await Project.findByIdAndDelete(project._id);
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        environments: createdEnvironments.map((env) => ({
          id: env._id,
          name: env.name,
          apiKeyPrefix: env.apiKeyPrefix,
        })),
        createdAt: project.createdAt,
      },
      // Save these keys securely. They are shown only at creation.
      environmentKeys: returnedKeys,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjects(req, res, next) {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('environments', 'name apiKeyPrefix')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const { projectId } = req.validated.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.id,
    }).populate('environments', 'name apiKeyPrefix');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.validated.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const project = await Project.findOneAndDelete({
      _id: projectId,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await Environment.deleteMany({ project: project._id });

    return res.status(200).json({
      success: true,
      message: 'Project and its environments deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
};
