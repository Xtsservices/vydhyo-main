require("dotenv").config();
const express = require("express");
const app = express();
const logger = require("./utils/logger");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const financeRoutes = require("./routes/finance");
const reportsRoutes = require("./routes/reports");
const appointmentsRoutes = require("./routes/appointments");  
const catalogueRoutes = require("./routes/catalogue");



app.use(express.json({ limit: "2mb", verify: (req, res, buf) => { req.rawBody = buf; } }));


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
