require('dotenv').config();
const jwt = require("jsonwebtoken");
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    verifyRefreshToken(req, res, () => {
      logger.info("proxy.js : proxyRequest : Token is valid, proceeding with the request...");
    });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  req.user = decoded;
  next();
};

module.exports = {
  verifyToken,
  verifyRefreshToken
};
