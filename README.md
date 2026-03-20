

# 📊 Diet Analysis Cloud Dashboard

## 🚀 Project Overview

This project is a cloud-based data analysis dashboard built using **Azure Functions** and a **React frontend**. It processes a diet dataset stored in Azure Blob Storage, performs data analysis, and visualizes the results through interactive charts.


### ✨ Key Features

* Serverless backend using Azure Functions
* Cloud storage with Azure Blob Storage
* Interactive charts (Bar, Line, Pie)
* Dynamic filtering by diet type
* Fully deployed on Azure Cloud

---

## ☁️ Azure Services Used

This project demonstrates cloud-native architecture using the following Azure services:

* **Azure Static Web Apps**
  → Hosts the frontend React application

* **Azure Functions**
  → Processes data and exposes REST API

* **Azure Blob Storage**
  → Stores the dataset (`All_Diets.csv`)

* **Azure App Service (Function App)**
  → Runs the backend function

---

## ⚙️ Backend Setup (Azure Function)

### 📁 Location

```text
/backend
```

### 🔧 Tech Stack

* Python
* Azure Functions SDK
* Azure Blob Storage SDK

### 🔑 Environment Variables

```text
AZURE_STORAGE_CONNECTION_STRING
BLOB_CONTAINER_NAME=datasets
BLOB_FILE_NAME=All_Diets.csv
```

### ▶️ Run Locally

```bash
cd backend
func start
```

### 🌐 API Endpoint

```text
GET /api/analyze-diets
```

Optional query:

```text
?dietType=Vegetarian
```

---

## 🎨 Frontend Setup (React + Vite)

### 📁 Location

```text
/frontend
```

### 🔧 Tech Stack

* React + TypeScript
* Vite
* Chart.js

---

### ▶️ Run Locally

```bash
cd frontend
npm install
npm run dev
```

---

### 🔗 API Integration

The frontend fetches data from:

```ts
const API_URL = "https://diet-chart-dashboard-318.azurewebsites.net/api/analyze-diets";
```

---

## 🌍 Deployment URLs

### 🖥 Frontend (Azure Static Web App)

```text
https://witty-pond-0e08a300f.6.azurestaticapps.net
```

---

### ⚙️ Backend (Azure Function API)

```text
https://diet-chart-dashboard-318.azurewebsites.net/api/analyze-diets
```

---

## 📸 Screenshots

### 📊 Dashboard Overview

```md
![Dashboard](./screenshots/dashboard.png)
```

---

### 📈 Charts Example

```md
![Charts](./screenshots/charts.png)
```

---

## 🧠 What I Learned

* Deploying serverless functions on Azure
* Handling cloud storage with Blob Storage
* Building full-stack cloud applications
* Debugging real-world issues (CORS, CI/CD, env variables)
* Integrating frontend with cloud backend

---

## 🔥 Challenges & Solutions

| Challenge                          | Solution                                     |
| ---------------------------------- | -------------------------------------------- |
| CORS error                         | Configured allowed origins in Azure Function |
| Environment variables not working  | Rebuilt frontend with correct config         |
| GitHub Actions deployment failed   | Fixed deployment token & workflow            |
| API returning HTML instead of JSON | Corrected API endpoint                       |

---

## 🧩 Future Improvements

* Add authentication (Azure AD / JWT)
* Improve UI/UX design
* Add more advanced analytics
* Enable real-time data updates

---


```text
Built a full-stack cloud-native dashboard using Azure Functions, Blob Storage, and React, handling real-world deployment challenges like CORS, CI/CD, and environment configuration.
```
