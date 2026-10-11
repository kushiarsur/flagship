
const express = require('express');
const authJwt = require('../middleware/authJwt');
const validate = require('../middleware/validate');

const {
  createFlagSchema,
  updateFlagSchema,
  flagParamsSchema,
  flagIdParamsSchema,
} = require('../utils/flagSchemas');

const {
  createFlag,
  getFlags,
  updateFlag,
  deleteFlag,
} = require('../controllers/flag.controller');

const router = express.Router();

// Protect only feature-flag management endpoints with JWT.
// Do not use router.use(authJwt), because this router is mounted at /api.
router.post(
  '/projects/:projectId/environments/:environmentId/flags',
  authJwt,
  validate(createFlagSchema),
  createFlag
);

router.get(
  '/projects/:projectId/environments/:environmentId/flags',
  authJwt,
  validate(flagParamsSchema),
  getFlags
);

router.patch(
  '/projects/:projectId/environments/:environmentId/flags/:flagId',
  authJwt,
  validate(updateFlagSchema),
  updateFlag
);

router.delete(
  '/projects/:projectId/environments/:environmentId/flags/:flagId',
  authJwt,
  validate(flagIdParamsSchema),
  deleteFlag
);

module.exports = router;
