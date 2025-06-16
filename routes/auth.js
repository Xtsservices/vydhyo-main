require('dotenv').config();
const express = require("express");
const router = express.Router();
const proxyRequest = require("../utils/proxy");
const logger = require("../utils/logger");
const { AUTH_SERVICE_URL } = process.env;


router.use((req, res) => {
  logger.info("Incoming request to /auth:", req.method, req.originalUrl);
  proxyRequest(req, res, AUTH_SERVICE_URL);
});

module.exports = router;
