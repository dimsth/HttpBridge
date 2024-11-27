const express = require("express");
const axios = require("axios");
const morgan = require("morgan");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL;

const app = express();
app.use(morgan("dev"));


app.get("/api/modalities", async (req, res) => {
    const userParams = req.query;

    try {
        const response = await axios.get(API_URL+"/modalities", {
            params: {
                ...userParams,
                select: userParams.select || "*,sensor_modalities(sensor_id,min_measurement,max_measurement)"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling the API:", error.message);
        res.status(500).json({ error: "Failed to fetch data from the API" });
    }
});

app.get("/api/fois", async (req, res) => {
    const userParams = req.query;

    try {
        const response = await axios.get(API_URL+"/fois", {
            params: {
                ...userParams,
                select: userParams.select || "*,device_ids:devices(id)"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling the API:", error.message);
        res.status(500).json({ error: "Failed to fetch data from the API" });
    }
});

app.get("/api/devices", async (req, res) => {
    const userParams = req.query;

    try {
        const response = await axios.get(API_URL+"/devices", {
            params: {
                ...userParams,
                select: userParams.select || "*,sensors:sensors.device_sensors(id,sensor_modalities(modality_id))"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling the API:", error.message);
        res.status(500).json({ error: "Failed to fetch data from the API" });
    }
});

app.get("/api/lma", async (req, res) => {
    const userParams = req.query;

    try {
        const response = await axios.get(API_URL+"/latest_measurements_averages", {
            params: {
                ...userParams,
                modality_id: userParams.modality_id || "in.(4,11,14)"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling the API:", error.message);
        res.status(500).json({ error: "Failed to fetch data from the API" });
    }
});


// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
