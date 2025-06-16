require('dotenv').config();
const express = require("express");
const router = express.Router();
const proxyRequest = require("../utils/proxy");
const logger = require("../utils/logger");
const { CATALOGUE_SERVICE_URL } = process.env;

router.use((req, res, next) => {
    logger.info("Incoming request to /catalogue:", req.method, req.originalUrl);
    next();
});

router.use((req, res) => {
    proxyRequest(req, res, CATALOGUE_SERVICE_URL);
});

module.exports = router;
