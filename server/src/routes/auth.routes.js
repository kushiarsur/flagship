
const express = require('express');
const rateLimit = require('express-rate-limit');

const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
} = require('../utils/authSchemas');

const {
  register,
  login,
} = require('../controllers/auth.controller');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again later.',
  },
});

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  login
);

module.exports = router;
