import azure.functions as func
import json
import os
import time
from io import StringIO

import pandas as pd
from azure.storage.blob import BlobServiceClient

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="analyze-diets", methods=["GET"])
def analyze_diets(req: func.HttpRequest) -> func.HttpResponse:
    start_time = time.time()

    try:
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        container_name = os.getenv("BLOB_CONTAINER_NAME", "datasets")
        blob_name = os.getenv("BLOB_FILE_NAME", "All_Diets.csv")

        if not connection_string:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "error": "Missing AZURE_STORAGE_CONNECTION_STRING"
                }),
                mimetype="application/json",
                status_code=500
            )

        diet_filter = req.params.get("dietType")

        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        blob_client = blob_service_client.get_blob_client(
            container=container_name,
            blob=blob_name
        )

        csv_data = blob_client.download_blob().readall().decode("utf-8")
        df = pd.read_csv(StringIO(csv_data))

        # basic cleaning
        df["Protein(g)"] = pd.to_numeric(df["Protein(g)"], errors="coerce")
        df["Carbs(g)"] = pd.to_numeric(df["Carbs(g)"], errors="coerce")
        df["Fat(g)"] = pd.to_numeric(df["Fat(g)"], errors="coerce")

        df = df.dropna(subset=["Diet_type", "Cuisine_type", "Protein(g)", "Carbs(g)", "Fat(g)"])

        if diet_filter and diet_filter.lower() != "all":
            df = df[df["Diet_type"].str.lower() == diet_filter.lower()]

        diet_counts = (
            df.groupby("Diet_type")
            .size()
            .reset_index(name="count")
            .to_dict(orient="records")
        )

        macro_averages = (
            df.groupby("Diet_type")[["Protein(g)", "Carbs(g)", "Fat(g)"]]
            .mean()
            .reset_index()
            .round(2)
            .rename(columns={
                "Protein(g)": "protein",
                "Carbs(g)": "carbs",
                "Fat(g)": "fat"
            })
            .to_dict(orient="records")
        )

        cuisine_counts = (
            df.groupby("Cuisine_type")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
            .head(8)
            .to_dict(orient="records")
        )

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        result = {
            "success": True,
            "recordCount": int(len(df)),
            "dietFilter": diet_filter if diet_filter else "all",
            "executionTimeMs": execution_time_ms,
            "charts": {
                "dietCounts": diet_counts,
                "macroAverages": macro_averages,
                "cuisineCounts": cuisine_counts
            }
        }

        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "error": str(e)
            }),
            mimetype="application/json",
            status_code=500
        )