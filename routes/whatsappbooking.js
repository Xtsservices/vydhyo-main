require('dotenv').config();
const express = require("express");
const router = express.Router();
const proxyRequest = require("../utils/proxy");
const logger = require("../utils/logger");
const { APPOINTMENTS_SERVICE_URL } = process.env;
router.use((req, res, next) => {
  logger.info("Incoming request to /whatsappbooking:", req.method, req.originalUrl);
  next();
});
router.use((req, res) => {
  proxyRequest(req, res, APPOINTMENTS_SERVICE_URL);
});

module.exports = router;
