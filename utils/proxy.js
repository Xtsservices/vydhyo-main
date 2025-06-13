const axios = require("axios");
const logger = require('../utils/logger');
const FormData = require("form-data");
const fs = require("fs");
const { verifyToken } = require("../middlewares/authMiddleware");
const openRoutes = require("../utils/openRoutes");

const isOpenRoute = (req) => {
  return openRoutes.some(route => {
    return route.method === req.method && route.path.test(req.path);
  });
};

const proxyRequest = async (req, res, targetUrl) => {
  try {
    const isMultipart = req.is("multipart/form-data");
    // Check if route is open
    if (isOpenRoute(req)) {
      logger.info(`proxy.js : proxyRequest : Open route - skipping token verification: ${req.path}`);
      const response = await axios({
        method: req.method,
        url: `${targetUrl}${req.originalUrl}`,
        data: req.rawBody,
        headers: req.headers,
      });
      return res.status(response.status).json(response.data);
    }

    // Auth logic for protected routes
    let token = req.headers["authorization"]?.split(" ")[1];
    // CASE 1: Token is present - validate it
    if (token) {
      try {
        verifyToken(req, res, () => {
          // Token is valid, proceed with                                                                                                                                                                                        h the request
          logger.info("proxy.js : proxyRequest : Token is valid, proceeding with the request...");
        })
      } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token...! " });
      }
    }
    // CASE 2: Token not present, use email/password to get one
    else if (req.body?.mobile) {
      logger.info("proxy.js : proxyRequest : No token, attempting login with email & password...");
      try {
        const response = await axios({
          method: req.method,
          url: `${targetUrl}${req.originalUrl}`,
          data: req.rawBody,
          headers: req.headers,
        });
        return res.status(response.status).json(response.data);
      } catch (loginErr) {
        return res.status(401).json({ error: "Something went wrong.", details: loginErr });
      }
    }
    // CASE 3: Neither token nor credentials
    else {
      return res.status(401).json({ error: "Missing token or credentials" });
    }
    // Forward the original request with the token added to headers
    const data = isMultipart ? buildFormData(req) : req.rawBody;
    const headers = {
      ...req.headers,
      ...req.user,
      authorization: `Bearer ${token}`,
      ...(isMultipart ? data.getHeaders() : {})
    };
    const response = await axios({
      method: req.method,
      url: `${targetUrl}${req.originalUrl}`,
      data,
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || { error: "Internal Server Error...", details: err.message };
    logger.error(`proxy.js : proxyRequest : Error : ${err.response?.data}`);
    res.status(status).json(message);
  }
};

/**
 * Builds FormData from the request (supports file streams and safely unlinks temp files)
 * @param {Object} req - Express request containing files and body
 * @returns {FormData} form - FormData object ready to send
 */
const buildFormData = (req) => {
  const form = new FormData();

  // Append regular form fields
  if (req.body) {
    Object.entries(req.body).forEach(([key, value]) => {
      form.append(key, value);
    });
  }

  // Append uploaded files (diskStorage only)
  if (req.files) {
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();

    for (const file of files) {
      if (file.path) {
        const stream = fs.createReadStream(file.path);
        form.append(file.fieldname, stream, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

        // Unlink file only after it's fully read
        stream.on("end", () => {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(`Error deleting file ${file.path}:`, err.message);
            }
          });
        });
      }
    }
  }

  return form;
};


module.exports = proxyRequest;
