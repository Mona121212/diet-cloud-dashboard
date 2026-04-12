import json
import os
from io import StringIO

import pandas as pd
from azure.storage.blob import BlobServiceClient


def get_blob_service_client():
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not connection_string:
        raise ValueError("Missing AZURE_STORAGE_CONNECTION_STRING")
    return BlobServiceClient.from_connection_string(connection_string)


def get_container_name():
    return os.getenv("BLOB_CONTAINER_NAME", "datasets")


def download_blob_text(blob_name: str) -> str:
    blob_service_client = get_blob_service_client()
    blob_client = blob_service_client.get_blob_client(
        container=get_container_name(),
        blob=blob_name
    )
    return blob_client.download_blob().readall().decode("utf-8")


def upload_blob_text(blob_name: str, content: str):
    blob_service_client = get_blob_service_client()
    blob_client = blob_service_client.get_blob_client(
        container=get_container_name(),
        blob=blob_name
    )
    blob_client.upload_blob(content, overwrite=True)


def download_csv_to_dataframe(blob_name: str) -> pd.DataFrame:
    csv_text = download_blob_text(blob_name)
    return pd.read_csv(StringIO(csv_text))


def upload_dataframe_as_csv(blob_name: str, df: pd.DataFrame):
    upload_blob_text(blob_name, df.to_csv(index=False))


def upload_json(blob_name: str, data: dict):
    upload_blob_text(blob_name, json.dumps(data))


def download_json(blob_name: str) -> dict:
    return json.loads(download_blob_text(blob_name))