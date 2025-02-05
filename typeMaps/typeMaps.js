const weatherObservedTypeMap = require("./weatherObservedTypeMaps");

// List of all available NGSI-LD model types
const typeMaps = {
    "WeatherObserved": weatherObservedTypeMap,
    // "WaterQualityObserved": waterQualityObservedTypeMap
};

module.exports = typeMaps;