import azure.functions as func
import json
import os
import time

from shared.blob_utils import (
    download_csv_to_dataframe,
    download_json,
    upload_dataframe_as_csv,
    upload_json,
)
from shared.data_processor import clean_diets_dataframe, build_chart_summary

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

SOURCE_BLOB = os.getenv("BLOB_FILE_NAME", "All_Diets.csv")
CLEANED_BLOB = "cleaned/cleaned_diets.csv"
SUMMARY_BLOB = "cache/dashboard_summary.json"


@app.blob_trigger(
    arg_name="inputblob",
    path="datasets/All_Diets.csv",
    connection="AzureWebJobsStorage"
)
def rebuild_cache_on_blob_change(inputblob: func.InputStream):
    try:
        df = download_csv_to_dataframe(SOURCE_BLOB)
        cleaned_df = clean_diets_dataframe(df)
        summary = build_chart_summary(cleaned_df)

        upload_dataframe_as_csv(CLEANED_BLOB, cleaned_df)
        upload_json(SUMMARY_BLOB, summary)

        print("Phase 3 cache rebuilt successfully.")
    except Exception as e:
        print(f"Blob trigger failed: {str(e)}")


@app.route(route="dashboard-summary", methods=["GET"])
def dashboard_summary(req: func.HttpRequest) -> func.HttpResponse:
    start_time = time.time()

    try:
        summary = download_json(SUMMARY_BLOB)
        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        result = {
            "success": True,
            "executionTimeMs": execution_time_ms,
            **summary
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


@app.route(route="recipes", methods=["GET"])
def get_recipes(req: func.HttpRequest) -> func.HttpResponse:
    try:
        df = download_csv_to_dataframe(CLEANED_BLOB)

        diet_type = (req.params.get("dietType") or "").strip()
        keyword = (req.params.get("keyword") or "").strip().lower()
        page = int(req.params.get("page", "1"))
        page_size = int(req.params.get("pageSize", "10"))

        if diet_type and diet_type.lower() != "all":
            df = df[df["Diet_type"].str.lower() == diet_type.lower()]

        if keyword:
            df = df[
                df["Recipe_name"].str.lower().str.contains(keyword, na=False) |
                df["Cuisine_type"].str.lower().str.contains(keyword, na=False)
            ]

        total = len(df)
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        paged_df = df.iloc[start_index:end_index]

        result = {
            "success": True,
            "page": page,
            "pageSize": page_size,
            "total": int(total),
            "totalPages": int(total_pages),
            "items": paged_df.to_dict(orient="records")
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