const express = require("express");
const axios = require("axios");
const NGSITranslator = require("../translator/NGSITranslator");

const router = express.Router();

// Mapping of type to modality IDs
const typeToModalityMap = {
    Temp: [4], // Temperature
    Humidity: [11], // Humidity
    Rainfall: [3], // Rainfall
    Light: [1], // Ambient Light
    Loudness: [2], // Loudness
    Ozone: [7], // Ozone
    NitrogenDioxide: [8], // Nitrogen Dioxide
    NitrogenOxide: [9], // Nitrogen Oxide
    Dust: [10], // Dust
    CarbonDioxide: [12], // Carbon Dioxide
    WindSpeed: [14], // Wind Speed
    WindDirection: [15], // Wind Direction
    SulphurDioxide: [6], // Sulphur Dioxide
    VOC: [5], // Volatile Organic Compounds
    AtmosphericPressure: [13], // Atmospheric Pressure
    WeatherObserved: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // All environmental measurements
    CarbonDioxideFlux: [26] // Carbon Dioxide Flux
};

// Helper function to generate modality_id parameter
function generateModalityIdParam(type) {
    const modalityIds = typeToModalityMap[type];
    if (!modalityIds) {
        throw new Error(`Invalid type: ${type}`);
    }
    return `in.(${modalityIds.join(",")})`;
}

// Route to handle temporal queries
router.get("/", async (req, res) => {
    try {
        console.log("Incoming request:", req.query);

        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ error: "Missing required parameter: type" });
        }

        // Generate modality_id based on the type parameter
        const modalityIdParam = generateModalityIdParam(type);

        // Fetch data from API
        const apiResponse = await axios.get(`${process.env.API_URL}/latest_measurements_averages`, {
            params: {
                modality_id: modalityIdParam,
            },
        });

        // Translate to NGSI-LD format
        const ngsiData = NGSITranslator.toWeatherObserved(apiResponse.data);

        // Send NGSI-LD response
        res.status(200).json(ngsiData);
    } catch (error) {
        console.error("Error in temporalEntities route:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch temporal entities." });
    }
});

module.exports = router;
