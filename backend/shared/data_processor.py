import pandas as pd

NUMERIC_COLUMNS = ["Protein(g)", "Carbs(g)", "Fat(g)"]
REQUIRED_COLUMNS = ["Diet_type", "Cuisine_type", "Recipe_name", "Protein(g)", "Carbs(g)", "Fat(g)"]

def clean_diets_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df.columns = [col.strip() for col in df.columns]

    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    for col in ["Diet_type", "Cuisine_type", "Recipe_name"]:
        df[col] = df[col].astype(str).str.strip()

    df = df.dropna(subset=REQUIRED_COLUMNS)

    df = df[df["Diet_type"] != ""]
    df = df[df["Cuisine_type"] != ""]
    df = df[df["Recipe_name"] != ""]

    return df


def build_chart_summary(df: pd.DataFrame) -> dict:
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

    diet_types = sorted(df["Diet_type"].dropna().unique().tolist())

    return {
        "recordCount": int(len(df)),
        "dietTypes": diet_types,
        "charts": {
            "dietCounts": diet_counts,
            "macroAverages": macro_averages,
            "cuisineCounts": cuisine_counts
        }
    }