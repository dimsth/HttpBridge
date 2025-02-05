# **HTTP Bridge for NGSI-LD Integration**

## **Overview**

The **HTTP Bridge** serves as a middleware between the **Scorpio Broker** and the **Smart City Heraklion API**. It is responsible for **fetching data from the API**, **translating it into the NGSI-LD format**, and **returning a structured response** that conforms to the **NGSI-LD data model**.

---

## **Getting Started**

### **1️. Prerequisites**
Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
---

### **2. Configuration**
Before running the application, configure the necessary environment variables.
- API_URL=https://smartcity.heraklion.gr/api
- PORT=8080
- HOST=http://localhost

### **3. Running the HTTP Bridge**
Start the server:
```
node app.js
```

The bridge will be accessible at: **{HOST}:{PORT}**

Default: **http://localhost:8080**

---

## **Supported NGSI-LD Entity Types**
| **Entity Type**      | **Description**                                        |
|----------------------|--------------------------------------------------------|
| `WeatherObserved`    | Real-time weather conditions (temperature, humidity, etc.) |

Additional entity types can be added dynamically by extending the **Type Mapping Configuration**.

---

## **Extending the Bridge**
To support more NGSI-LD models, simply:
1. **Add a new type mapping** in `typeMaps/`
2. **Extend `NGSITranslator.js`** to handle the new entity type
3. **Modify `temporalController.js`** to process the new queries