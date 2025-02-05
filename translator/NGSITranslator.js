const typeMaps = require("../typeMaps/typeMaps");

class NGSITranslator {
    static toNGSI(apiData, entityType) {
        const typeMap = typeMaps[entityType];
        if (!typeMap) {
            throw new Error(`No mapping found for entity type: ${entityType}`);
        }

        const groupedByDevice = apiData.reduce((acc, item) => {
            const { device_id, modality_id, value, observed_at } = item;

            if (!acc[device_id]) {
                acc[device_id] = {
                    id: `urn:ngsi-ld:Device:${device_id}`,
                    type: entityType,
                };
            }

            const modalityInfo = typeMap[modality_id];
            if (modalityInfo) {
                const property = NGSITranslator.createProperty(
                    value,
                    modalityInfo.unit,
                    modalityInfo.min,
                    modalityInfo.max,
                    modalityInfo.slug
                );

                if (property !== undefined) {
                    acc[device_id][modalityInfo.key] = property;
                }
            }

            if (observed_at) {
                acc[device_id]["dateObserved"] = { type: "Property", value: observed_at };
            }

            return acc;
        }, {});

        return Object.values(groupedByDevice);
    }

    static createProperty(value, unit, min, max, slug) {
        if (value == null) return undefined;

        return {
            type: "Property",
            value: value,
            metadata: {
                unitCode: { type: "Property", value: unit },
                healthRange: { type: "Property", value: { min, max } },
                slug: { type: "Property", value: slug },
            },
        };
    }
}

module.exports = NGSITranslator;
