const typeMaps = require("../typeMaps/typeMaps");

class NGSITranslator {
    static toNGSI(apiData, entityType) {
        switch (entityType) {
            case "WeatherObserved":
                return NGSITranslator.processWeatherObserved(apiData, entityType);
            default:
                throw new Error(`Unsupported entity type: ${entityType}`);
        }
    }

    static processWeatherObserved(apiData, entityType) {
        const typeMap = typeMaps[entityType];
        if (!typeMap) {
            throw new Error(`No mapping found for entity type: ${entityType}`);
        }

        const groupedByDevice = {};

        apiData.forEach(item => {
            const { device_id, modality_id, value, observed_at } = item;

            // Ensure the device entry exists
            if (!groupedByDevice[device_id]) {
                groupedByDevice[device_id] = {
                    id: `urn:ngsi-ld:Device:${device_id}`,
                    type: entityType,
                    dateObserved: { type: "Property", values: [] },
                    "@context": [
                        "https://raw.githubusercontent.com/smart-data-models/dataModel.Weather/master/context.jsonld",
                        "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
                    ]
                };
            }

            const modalityInfo = typeMap[modality_id];
            if (modalityInfo) {
                // Ensure property exists, else initialize
                if (!groupedByDevice[device_id][modalityInfo.key]) {
                    groupedByDevice[device_id][modalityInfo.key] = {
                        type: "Property",
                        values: []
                    };
                }

                // Append new observation instead of overwriting
                groupedByDevice[device_id][modalityInfo.key].values.push(
                    NGSITranslator.createProperty(value, modalityInfo.unit, modalityInfo.min, modalityInfo.max, modalityInfo.slug, observed_at)
                );

                // Append observed_at to dateObserved (avoid duplicates)
                if (!groupedByDevice[device_id].dateObserved.values.includes(observed_at)) {
                    groupedByDevice[device_id].dateObserved.values.push(observed_at);
                }
            }
        });

        return Object.values(groupedByDevice);
    }

    static createProperty(value, unit, min, max, slug, observedAt = null) {
        if (value == null) return undefined;
    
        return {
            type: "Property",
            values: [
                {
                    value: value,
                    // Extra data (optional)
                    metadata: {
                        unitCode: { type: "Property", value: unit },
                        healthRange: { type: "Property", value: { min, max } },
                        slug: { type: "Property", value: slug }
                    },
                    ...(observedAt ? { observedAt: observedAt } : {}) // Include `observedAt` only if present
                }
            ]
        };
    }
}

module.exports = NGSITranslator;
