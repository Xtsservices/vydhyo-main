require('dotenv').config();
const express = require("express");
const router = express.Router();
const proxyRequest = require("../utils/proxy");
const logger = require("../utils/logger");
const { FINANCE_SERVICE_URL } = process.env;

router.use((req, res, next) => {
    logger.info("Incoming request to /finance:", req.method, req.originalUrl);
    next();
});

router.use((req, res) => {
    proxyRequest(req, res, FINANCE_SERVICE_URL);
});

module.exports = router;
