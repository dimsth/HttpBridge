# **HTTP Bridge for NGSI-LD Integration**

## **Overview**

The **HTTP Bridge** serves as a middleware between the **Scorpio Broker** and the **Smart City Heraklion API**. It is responsible for **fetching data from the API**, **translating it into the NGSI-LD format**, and **returning a structured response** that conforms to the **NGSI-LD data model**.

---

## **Getting Started**

### **1. Prerequisites**
Ensure you have the following installed:
- **Docker** 
- **Node.js** (v14 or higher, if running locally)
- **npm** (Node Package Manager)
---

### **2. Configuration**
Before running the application, configure the necessary environment variables.

### **Using `.env` File (Recommended)**
Create a `.env` file in the project root with the following content:

```
PORT=9010 # Http Bridge Port
HOST="0.0.0.0" # Http Bridge Host (DONT CHANGE id running with Docker)
API_URL=https://smartcity.heraklion.gr/open-data-api # Base URL of the API
```

### **3. Running the HTTP Bridge**
1. Install npm packages
```
npm install
```

2. Build the Docker Image
```
docker build -t http-bridge .
```

3. Run the Container

```
docker run -d --name http-bridge -p 8080:8080 --env-file .env http-bridge
```

The bridge will be accessible at: **{HOST}:{PORT}**

Default: **http://localhost:8080**

---
### **4. Stopping & Removing the Container**

1. To stop the running container:
```
docker stop http-bridge
```

2. To remove the container:
```
docker rm http-bridge
```

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
3. **Modify `generalControllers.js`** to process the new queries

---

## **Extra Links**
[Scorpio Broker](https://github.com/efntallaris/scorpioBroker)
[Postman Workplace](https://www.postman.com/payload-geoscientist-32828968/workspace/scorpio-broker-registration)