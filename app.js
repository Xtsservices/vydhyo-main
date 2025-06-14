require("dotenv").config();
const fs = require('fs');
const express = require("express");
const app = express();
const logger = require("./utils/logger");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const financeRoutes = require("./routes/finance");
const reportsRoutes = require("./routes/reports");
const appointmentsRoutes = require("./routes/appointments");
const catalogueRoutes = require("./routes/catalogue");


const upload = multer({ dest: "uploads/" });

app.use(express.json({ limit: "2mb", verify: (req, res, buf) => { req.rawBody = buf; } }));

// This handles all incoming multipart/form-data requests
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload error", details: err.message });
      }
      next();
    });
  } else {
    next();
  }
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/finance", financeRoutes);
app.use("/reports", reportsRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/catalogue", catalogueRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
