const axios = require("axios");
const NGSITranslator = require("../translator/NGSITranslator");
const typeMaps = require("../typeMaps/typeMaps");

/**
 * Generates a modality_id parameter based on the type and attributes provided.
 * If attributes are given, it will filter the modalities to only include the ones
 * that correspond to the given attributes. Otherwise, it will return all modalities
 * available for the given type.
 * 
 * Based on Smart City Heraklion API
 *
 * @param {string} type The NGSI-LD type to generate the modality_id for
 * @param {string} attributes A comma-separated list of attributes to filter by
 * @throws {Error} If the type is invalid or no valid attributes are found
 * @returns {string} The modality_id parameter as a string
 */
function generateModalityIdParam(type, attributes) {
    const modalityMap = typeMaps[type];
    if (!modalityMap) {
        throw new Error(`Invalid type: ${type}`);
    }

    // Filter attributes if provided, otherwise return all
    const modalityIds = attributes
        ? attributes.split(",").map(attr => Object.entries(modalityMap)
            .find(([_, value]) => value.key === attr)?.[0])
            .filter(Boolean)
        : Object.keys(modalityMap);

    if (modalityIds.length === 0) {
        throw new Error(`No valid attributes found for type: ${type}`);
    }

    return `in.(${modalityIds.join(",")})`;
}

const getTemporalEntities = async (req, res) => {
    try {
        // Log the incoming request query
        console.log("Incoming request:", req.query);
        const { type, timerel, time, endTime, attrs } = req.query;

        if (!type) {
            return res.status(400).json({ error: "Missing required parameter: type" });
        }

        if (!typeMaps[type]) {
            return res.status(400).json({ error: `Unsupported entity type: ${type}` });
        }

        // Generate the modality_id parameter
        const modalityIdParam = generateModalityIdParam(type, attrs);

        let apiResponse;

        // Make the API request
        switch (type) {
            case "WeatherObserved":
                if (!modalityIdParam) return res.status(400).json({ error: "Missing modality_id parameter." });
                apiResponse = await axios.get(`${process.env.API_URL}/latest_measurements_averages`, {
                    params: { modality_id: modalityIdParam },
                });
                break;
            //case "WaterQualityObserved":
            // ...
            default:
                return res.status(400).json({ error: `Unsupported entity type: ${type}` });
        }

        if (!apiResponse || !apiResponse.data) {
            return res.status(500).json({ error: "Failed to retrieve data from API." });
        }

        // Translate the API response to NGSI-LD
        const ngsiData = NGSITranslator.toNGSI(apiResponse.data, type);

        res.status(200).json(ngsiData);
    } catch (error) {
        console.error("Error in TemporalEntitiesController:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch temporal entities." });
    }
};

module.exports = { getTemporalEntities };
