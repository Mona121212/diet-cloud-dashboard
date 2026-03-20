# Diet Analysis Cloud Dashboard

## Project Overview

This project is a cloud-based dashboard that analyzes a diet dataset and presents the results using charts. The backend is built with Azure Functions and processes data stored in Azure Blob Storage. The frontend is a React application that displays the results in a simple and interactive way.

The goal of this project was to understand how to build and deploy a full-stack application using Azure services instead of running everything locally.

---

## Azure Services Used

* **Azure Static Web Apps**
  Used to host and deploy the React frontend.

* **Azure Functions**
  Used as the backend API to process data and return results.

* **Azure Blob Storage**
  Stores the dataset (`All_Diets.csv`) used for analysis.

---

## Backend Setup

The backend is located in the `/backend` folder and built using Python and Azure Functions.

### Main Responsibilities

* Read CSV data from Azure Blob Storage
* Clean and process the dataset
* Generate aggregated results (diet counts, macros, cuisine types)
* Return JSON data through an HTTP endpoint

### Environment Variables

The following environment variables are required:

```
AZURE_STORAGE_CONNECTION_STRING
BLOB_CONTAINER_NAME=datasets
BLOB_FILE_NAME=All_Diets.csv
```

### Run Locally

```
cd backend
func start
```

### API Endpoint

```
GET /api/analyze-diets
```

Optional query parameter:

```
?dietType=Vegetarian
```

---

## Frontend Setup

The frontend is located in the `/frontend` folder and built with React and Vite.

### Features

* Displays charts using Chart.js (bar, line, pie)
* Allows filtering by diet type
* Shows summary information such as record count and execution time

### Run Locally

```
cd frontend
npm install
npm run dev
```

### API Integration

The frontend calls the deployed Azure Function:

```
https://diet-chart-dashboard-318.azurewebsites.net/api/analyze-diets
```

---

## Deployment URLs

Frontend (Azure Static Web App):

```
https://witty-pond-0e08a300f.6.azurestaticapps.net
```

Backend (Azure Function):

```
https://diet-chart-dashboard-318.azurewebsites.net/api/analyze-diets
```

---

## Screenshots

You can add screenshots in a `/screenshots` folder.

Example:

```
![Dashboard](./screenshots/dashboard.png)
![Charts](./screenshots/charts.png)
```

---

## What I Learned

* How to deploy a serverless backend using Azure Functions
* How to store and access data using Azure Blob Storage
* How to connect a frontend application to a cloud API
* How to debug real deployment issues such as CORS and environment variables
* How to use GitHub Actions for CI/CD deployment

---

## Challenges

One of the main challenges was dealing with deployment and integration issues. For example:

* The frontend initially failed to fetch data due to incorrect environment variable configuration
* The API returned errors due to missing Blob Storage settings
* CORS needed to be configured in Azure Functions to allow requests from the frontend

These issues helped me understand how different cloud components interact with each other.

---

## Future Improvements

* Improve UI design and layout
* Add authentication (login system)
* Support more filtering options
* Optimize performance for larger datasets


