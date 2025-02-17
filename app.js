const express = require("express");
const morgan = require("morgan");
const temporalRoutes = require("./routes/temporalRoute");
const realTimeRoutes = require("./routes/realTimeRoute");

require("dotenv").config();

const PORT = process.env.PORT || 9010;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
app.use(morgan("dev"));

app.use("/ngsi-ld/v1/temporal/entities", temporalRoutes);
app.use("/ngsi-ld/v1/entities", realTimeRoutes );

// Start the Express server
app.listen(PORT, HOST, () => {
    console.log(`HTTP Bridge is running on ${HOST}:${PORT}`);
});
