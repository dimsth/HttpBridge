const axios = require("axios");
const NGSITranslator = require("../translator/NGSITranslator");

class TemporalEntitiesController {
    async getAll(req, res) {
        try {
            console.log("Incoming temporal query:", req.query);

            // Fetch raw data from the API wrapper
            const apiResponse = await axios.get(`${process.env.API_URL}/latest_measurements_averages`, {
                params: req.query,
            });

            console.log("API response:", apiResponse.data);

            // Translate the API data into NGSI-LD format
            const ngsiData = NGSITranslator.toWeatherObserved(apiResponse.data);

            console.log("NGSI-LD response:", ngsiData);

            // Send the NGSI-LD formatted response
            res.status(200).json(ngsiData);
        } catch (error) {
            console.error("Error in TemporalEntitiesController:", error.message);
            res.status(500).json({ error: "Failed to fetch temporal entities." });
        }
    }
}

module.exports = new TemporalEntitiesController();
