const axios = require("axios");
const NGSITranslator = require("../translator/NGSITranslator");
const typeMaps = require("../typeMaps/typeMaps");

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
        console.log("Incoming request:", req.query);

        const { type, attrs } = req.query;

        if (!type) {
            return res.status(400).json({ error: "Missing required parameter: type" });
        }

        if (!typeMaps[type]) {
            return res.status(400).json({ error: `Unsupported entity type: ${type}` });
        }

        const modalityIdParam = generateModalityIdParam(type, attrs);

        let apiResponse;

        switch (type) {
            case "WeatherObserved":
                if (!modalityIdParam) return res.status(400).json({ error: "Missing modality_id parameter." });
                apiResponse = await axios.get(`${process.env.API_URL}/latest_measurements_averages`, {
                    params: { modality_id: modalityIdParam },
                });
                break;
            default:
                return res.status(400).json({ error: `Unsupported entity type: ${type}` });
        }

        if (!apiResponse || !apiResponse.data) {
            return res.status(500).json({ error: "Failed to retrieve data from API." });
        }

        const ngsiData = NGSITranslator.toNGSI(apiResponse.data, type);

        res.status(200).json(ngsiData);
    } catch (error) {
        console.error("Error in TemporalEntitiesController:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch temporal entities." });
    }
};

module.exports = { getTemporalEntities };
