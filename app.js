const express = require("express");
const morgan = require("morgan");
const temporalRoutes = require("./routes/temporalRoute");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "http://localhost";

const app = express();
app.use(morgan("dev"));

// Define routes
app.use("/ngsi-ld/v1/temporal/entities", temporalRoutes);

// Start the Express server
app.listen(PORT, () => {
    console.log(`HTTP Bridge is running on ${HOST}:${PORT}`);
});
