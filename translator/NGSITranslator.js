class NGSITranslator {
    // Reverse mapping of modality_id to measurement types and metadata
    static modalityToTypeMap = {
        4: { key: "temperature", unit: "°C", min: -10, max: 50, slug: "ambient-temperature" },
        11: { key: "humidity", unit: "%RH", min: 0, max: 100, slug: "ambient-humidity" },
        3: { key: "rainfall", unit: "mm", min: 0, max: 8, slug: "rain" },
        1: { key: "light", unit: "Lux", min: 0, max: 12000, slug: "ambient-light" },
        2: { key: "loudness", unit: "dB", min: 34.6, max: 85, slug: "noise" },
        7: { key: "ozone", unit: "ppb", min: 0, max: 47.3, slug: "o3" },
        8: { key: "nitrogenDioxide", unit: "ppb", min: 0, max: 19.7, slug: "no2" },
        9: { key: "nitrogenOxide", unit: "ppb", min: 0, max: 25000, slug: "no" },
        10: { key: "dust", unit: "μg/m³", min: 0, max: 50, slug: "pm10" },
        12: { key: "carbonDioxide", unit: "ppm", min: 0, max: 430, slug: "co2" },
        14: { key: "windSpeed", unit: "Km/h", min: 0, max: 50, slug: "wind-speed" },
        15: { key: "windDirection", unit: "deg", min: 0, max: 359.9, slug: "wind-direction" },
        6: { key: "sulphurDioxide", unit: "ppb", min: 0, max: 7.09, slug: "so2" },
        5: { key: "voc", unit: "ppb", min: 0, max: 600, slug: "voc" },
        13: { key: "atmosphericPressure", unit: "hPa", min: 750, max: 1050, slug: "atmospheric-pressure" },
    };

    static toWeatherObserved(apiData) {
        const groupedByDevice = apiData.reduce((acc, item) => {
            const { device_id, modality_id, value } = item;

            if (!acc[device_id]) {
                acc[device_id] = {
                    id: `urn:ngsi-ld:Device:${device_id}`,
                    type: "WeatherObserved",
                };
            }

            const modalityInfo = NGSITranslator.modalityToTypeMap[modality_id];
            if (modalityInfo) {
                acc[device_id][modalityInfo.key] = NGSITranslator.createProperty(
                    value,
                    modalityInfo.unit,
                    modalityInfo.min,
                    modalityInfo.max,
                    modalityInfo.slug
                );
            }

            return acc;
        }, {});

        return Object.values(groupedByDevice);
    }

    // Helper function to create NGSI-LD Property objects
    static createProperty(value, unit, min, max, slug) {
        return {
            type: "Property",
            value: value,
            metadata: {
                unitCode: {
                    type: "Property",
                    value: unit,
                },
                healthRange: {
                    type: "Property",
                    value: { min, max },
                },
                slug: {
                    type: "Property",
                    value: slug,
                },
            },
        };
    }
}

module.exports = NGSITranslator;
