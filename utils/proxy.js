const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require('../utils/logger');

const JWT_SECRET_KEY = process.env.JWT_SECRET;

const proxyRequest = async (req, res, targetUrl) => {
  try {
    let token = req.headers["authorization"]?.split(" ")[1];
    // CASE 1: Token is present - validate it
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded;
      } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token..........." });
      }
    } 
    // CASE 2: Token not present, use email/password to get one
    else if (req.body?.email && req.body?.password) {
      logger.info("proxy.js : proxyRequest : No token, attempting login with email & password...");
      try {
        const response = await axios({
          method: req.method,
          url: `${targetUrl}${req.originalUrl}`,
          data: req.rawBody,
          headers: req.headers,
        });

        token = response.data.token;
      } catch (loginErr) {
        return res.status(401).json({ error: "Invalid credentials", details: loginErr?.response?.data });
      }
    } 
    // CASE 3: Neither token nor credentials
    else {
      return res.status(401).json({ error: "Missing token or credentials" });
    }
    // Forward the original request with the token added to headers
    const response = await axios({
      method: req.method,
      url: `${targetUrl}${req.originalUrl}`,
      data: req.rawBody,
      headers: {
        ...req.headers,
        ...req.user,
        authorization: `Bearer ${token}`,
      },
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || { error: "Internal Server Error", details: err.message };
    logger.error(`proxy.js : proxyRequest : Error : ${err.response?.data}`);
    res.status(status).json(message);
  }
};

module.exports = proxyRequest;
