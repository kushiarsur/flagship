
const express = require('express');
const environmentKey = require('../middleware/environmentKey');
const { evaluateFlag } = require('../controllers/evaluation.controller');

const router = express.Router();

router.get('/:flagName', environmentKey, evaluateFlag);

module.exports = router;
