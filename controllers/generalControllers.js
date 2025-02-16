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
            .find(([_, value]) => value.slug === attr)?.[0])
            .filter(Boolean)
        : Object.keys(modalityMap);

    if (modalityIds.length === 0) {
        throw new Error(`No valid attributes found for type: ${type}`);
    }

    return modalityIds;
}

/**
 * Fetches data from the Smart City Heraklion API and translates it to NGSI-LD.
 * 
 * @param {string} type The NGSI-LD type to retrieve
 * @param {string} [attrs] A comma-separated list of attributes to filter by
 * @param {Function} fetcher The specific fetcher function to use (fetchWeatherObservedTemporalData or fetchWeatherObservedRealTimeData)
 * @param {Object} [additionalParams] Additional parameters to pass to the fetcher function
 * @param {Response} res The Express response object
 * @throws {Error} If the type is invalid, no valid attributes are found, or the API request fails
 */
const fetchEntities = async (type, attrs, fetcher, additionalParams, res) => {
    try {
        if (!type) {
            return res.status(400).json({ error: "Missing required parameter: type" });
        }

        if (!typeMaps[type]) {
            return res.status(400).json({ error: `Unsupported entity type: ${type}` });
        }

        const modalityIdParam = generateModalityIdParam(type, attrs);
        if (!modalityIdParam) {
            return res.status(400).json({ error: "Missing modality_id parameter." });
        }

        // Call the specific fetcher function
        const apiResponse = await fetcher(type, modalityIdParam, additionalParams);

        if (!apiResponse || !apiResponse.data) {
            return res.status(500).json({ error: "Failed to retrieve data from API." });
        }

        // Translate response to NGSI-LD
        const ngsiData = NGSITranslator.toNGSI(apiResponse.data, type);
        res.status(200).json(ngsiData);
    } catch (error) {
        console.error("Error in fetchEntities:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch entities." });
    }
};

/**
 * Fetches the temporal data for a given NGSI-LD entity type.
 * 
 * @param {string} type The NGSI-LD type to retrieve
 * @param {string} modalityIdParam The modality_id parameter for filtering
 * @param {Object} [params] Additional parameters for the API request
 * @throws {Error} If the entity type is unsupported
 */
const fetchWeatherObservedTemporalData = async (type, modalityIds, params) => {
    if (!Array.isArray(modalityIds) || modalityIds.length === 0) {
        throw new Error(`Invalid modality IDs for type: ${type}`);
    }

    const results = { data: [] };

    // Loop through each modality ID and make separate requests
    for (const modalityId of modalityIds) {
        try {
            const apiResponse = await axios.post(`${process.env.API_URL}/rpc/measurements_averages`, {
                _devices: "{71,72,73,63,64,36,68,70,61,69,67,66,65,60,59,120}",
                _from: params.time,
                _to: params.endTime,
                _granularity: "1 hour",
                _modality: typeMaps[type][modalityId].key,
                _show_out_of_range: false
            });

            if (apiResponse && apiResponse.data) {
                formattedData = apiResponse.data.map(entry => ({
                    device_id: modalityId,
                    modality_id: parseInt(modalityId, 10),
                    value: entry.avg, 
                    observed_at: entry.at
                }));

                results.data.push(...formattedData);
            }
        } catch (error) {
            console.error(`Error fetching data for modalityId ${modalityId}:`, error.message);
        }
    }

    return results;
};

/**
 * Fetches the latest real-time data for a given NGSI-LD entity type.
 * 
 * @param {string} type The NGSI-LD type to retrieve
 * @param {string} modalityIdParam The modality_id parameter for filtering
 * @throws {Error} If the entity type is unsupported
 */

const fetchWeatherObservedRealTimeData = async (type, modalityIdParam) => {
    switch (type) {
        case "WeatherObserved":
            return axios.get(`${process.env.API_URL}/latest_measurements_averages`, {
                params: { modality_id: `in.(${Array.isArray(modalityIdParam) ? modalityIdParam.join(",") : modalityIdParam})` },
            });
        default:
            throw new Error(`Unsupported real-time entity type: ${type}`);
    }
};


/**
 * Handles incoming requests for temporal NGSI-LD entities.
 * 
 * @prop {string} type The NGSI-LD type to retrieve
 * @prop {string} timerel The temporal relationship to apply (e.g. "after", "before")
 * @prop {string} time The timestamp to apply the temporal relationship to
 * @prop {string} endTime The end time for the time range query
 * @prop {string} attrs A comma-separated list of attributes to filter by
 */
const getTemporalEntities = async (req, res) => {
    console.log("Incoming temporal request:", req.query);
    let { type, timerel, time, endTime, attrs } = req.query;

    // Decode URL-encoded time values (fixes %3A issue)
    time = decodeURIComponent(time);
    if (endTime) endTime = decodeURIComponent(endTime);

    // Ensure proper ISO 8601 formatting
    const now = new Date().toISOString();

    if (timerel === "after") {
        endTime = now; // Set endTime to current time
    } else if (timerel === "before") {
        endTime = time; // Swap values for "before"
        time = new Date(new Date(endTime).setDate(new Date(endTime).getDate() - 30)).toISOString(); // 30 days before
    }

    await fetchEntities(type, attrs, fetchWeatherObservedTemporalData, { time, endTime }, res);
};

/**
 * Handles incoming requests for real-time NGSI-LD entities.
 * 
 * @prop {string} type The NGSI-LD type to retrieve
 * @prop {string} attrs A comma-separated list of attributes to filter by
 */
const getRealTimeEntities = async (req, res) => {
    console.log("Incoming real-time request:", req.query);
    const { type, attrs } = req.query;
    await fetchEntities(type, attrs, fetchWeatherObservedRealTimeData, {}, res);
};

module.exports = { getTemporalEntities, getRealTimeEntities };
