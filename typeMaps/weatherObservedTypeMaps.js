const weatherObservedTypeMap = {
    1: { key: "light", unit: "LUX", min: 0, max: 12000, slug: "light" },
    2: { key: "loudness", unit: "DEC", min: 34.6, max: 85, slug: "noise" },
    3: { key: "rainfall", unit: "MMT", min: 0, max: 8, slug: "rain" },
    4: { key: "temperature", unit: "CEL", min: -10, max: 50, slug: "temperature" },
    5: { key: "voc", unit: "PPB", min: 0, max: 600, slug: "voc" },
    6: { key: "sulphurDioxide", unit: "PPB", min: 0, max: 7.09, slug: "so2" },
    7: { key: "ozone", unit: "PPB", min: 0, max: 47.3, slug: "o3" },
    8: { key: "nitrogenDioxide", unit: "PPB", min: 0, max: 19.7, slug: "no2" },
    9: { key: "nitrogenOxide", unit: "PPB", min: 0, max: 25000, slug: "no" },
    10: { key: "dust", unit: "MCG", min: 0, max: 50, slug: "pm10" },
    11: { key: "humidity", unit: "P1", min: 0, max: 100, slug: "humidity" },
    12: { key: "carbonDioxide", unit: "PPM", min: 0, max: 430, slug: "co2" },
    13: { key: "atmosphericPressure", unit: "HPA", min: 750, max: 1050, slug: "atmospheric-pressure" },
    14: { key: "windSpeed", unit: "KMT", min: 0, max: 50, slug: "wind-speed" },
    15: { key: "windDirection", unit: "DEG", min: 0, max: 359.9, slug: "wind-direction" },
};

module.exports = weatherObservedTypeMap;