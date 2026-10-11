
const express = require('express');
const authJwt = require('../middleware/authJwt');
const validate = require('../middleware/validate');

const {
  createProjectSchema,
  projectIdSchema,
} = require('../utils/projectSchemas');

const {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
} = require('../controllers/project.controller');

const router = express.Router();

// All project routes require authentication.
router.use(authJwt);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:projectId', validate(projectIdSchema), getProjectById);
router.delete('/:projectId', validate(projectIdSchema), deleteProject);

module.exports = router;
