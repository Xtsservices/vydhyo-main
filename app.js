require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors');
const logger = require("./utils/logger");
const multer = require("multer");


const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const financeRoutes = require("./routes/finance");
const reportsRoutes = require("./routes/reports");
const appointmentsRoutes = require("./routes/appointments");
const catalogueRoutes = require("./routes/catalogue");
 const superAdminRoutes = require("./routes/superadmin");
 const doctordashbaordRoutes = require("./routes/doctordashbaord");
const addressRoutes = require("./routes/address");
const labRoutes = require("./routes/lab")



const upload = multer({ dest: "uploads/" });
app.use(cors());

app.use(express.json({ limit: "15mb", verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
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
app.use("/appointment", appointmentsRoutes);
app.use("/catalogue", catalogueRoutes);
app.use("/admin", userRoutes);
app.use("/doctor", userRoutes);
app.use("/receptionist", userRoutes);
app.use("/superAdmin", superAdminRoutes);
app.use("/doctorDashboard", doctordashbaordRoutes);
app.use("/address", addressRoutes);
app.use("/pharmacy", userRoutes);
app.use("/lab", labRoutes);






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
