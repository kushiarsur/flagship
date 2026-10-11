
const express = require('express');
const authJwt = require('../middleware/authJwt');
const {
  rotateEnvironmentKey,
} = require('../controllers/environment.controller');

const router = express.Router();

router.post(
  '/projects/:projectId/environments/:environmentId/rotate-key',
  authJwt,
  rotateEnvironmentKey
);

module.exports = router;
