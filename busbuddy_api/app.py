import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from fetch_realtime_data import fetch_real_time_data, parse_protobuf
from datetime import datetime
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load Model & Scaler
model = load_model("passenger_demand_forecast.keras", compile=False)
model.compile(optimizer='rmsprop')
scaler = joblib.load("scaler.pkl")

app = FastAPI(title="BusBuddy Real-Time Dashboard")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to ["http://localhost:3000"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the static directory exists
os.makedirs("static", exist_ok=True)

# Ensure the favicon file exists (Create a placeholder if missing)
favicon_path = "static/favicon.ico"
if not os.path.exists(favicon_path):
    with open(favicon_path, "wb") as f:
        f.write(b"\x00")  # Create a minimal empty favicon file

# Mount static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Serve the favicon to prevent 404 errors"""
    return FileResponse(favicon_path)

@app.get("/", response_class=HTMLResponse)
async def root():
    """Homepage displaying real-time vehicle data (showing ALL vehicles)"""
    try:
        vehicles = get_vehicle_data()
        table_html = generate_html_table(vehicles)  # Show ALL vehicles

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>BusBuddy Dashboard</title>
            <link rel="icon" href="/static/favicon.ico">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                .container {{ max-width: 95%; }}  /* Make full-width */
                table {{ font-size: 14px; }}  /* Reduce table font size */
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚌 BusBuddy Real-Time Dashboard</h1>
                <p>Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>

                <!-- 🚀 Added Predict Demand Button -->
                <div class="mb-3">
                    <a href="/predict_realtime/" class="btn btn-primary">Predict Demand</a>
                </div>

                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5>Live Vehicle Positions</h5>
                    </div>
                    <div class="card-body">
                        {table_html}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    except Exception as e:
        return HTMLResponse(content=f"<h2>Error</h2><p>{str(e)}</p>", status_code=500)



@app.get("/predict_realtime/", response_class=JSONResponse)
async def predict_realtime_demand():
    """Predict passenger demand per Route ID, then merge with vehicles"""
    try:
        vehicles = get_vehicle_data()

        if vehicles.empty:
            return JSONResponse(content={"error": "No vehicle data available"}, status_code=404)

        required_columns = {"Route ID", "Timestamp"}
        if not required_columns.issubset(vehicles.columns):
            return JSONResponse(content={"error": f"Missing columns: {required_columns - set(vehicles.columns)}"}, status_code=400)

        # Feature Engineering
        vehicles["Hour"] = vehicles["Timestamp"].dt.hour
        vehicles["Day of Week"] = vehicles["Timestamp"].dt.dayofweek
        vehicles["Month"] = vehicles["Timestamp"].dt.month
        vehicles["Time Bin"] = (vehicles["Hour"] * 60) // 5

        # Convert Route ID to numeric
        vehicles["Route ID"] = pd.to_numeric(vehicles["Route ID"], errors='coerce')

        # Group by "Route ID" and select the latest record per route
        grouped_routes = vehicles.groupby("Route ID").last().reset_index()

        # Select features for prediction
        feature_columns = ["Route ID", "Hour", "Time Bin", "Day of Week", "Month"]
        features = grouped_routes[feature_columns].dropna()

        # Scale only "Route ID"
        route_id_scaled = scaler.transform(features[["Route ID"]].to_numpy())
        features["Route ID"] = route_id_scaled.flatten()

        # Convert to NumPy array and reshape input for prediction
        features_np = features.to_numpy()
        input_data = features_np.reshape(features_np.shape[0], 1, features_np.shape[1])

        # Predict demand per Route ID
        predictions = model.predict(input_data).flatten().round(2)

        # Create a mapping of Route ID to predicted demand
        demand_mapping = dict(zip(grouped_routes["Route ID"], predictions))

        # Merge demand values back into the vehicles DataFrame
        vehicles["Predicted Demand"] = vehicles["Route ID"].map(demand_mapping)

        # Create results DataFrame
        results = vehicles[["Route ID", "Predicted Demand", "Vehicle ID", "Latitude", "Longitude"]].copy()
        results["Last Updated"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # ✅ Return JSON instead of HTML
        return JSONResponse(content=results.to_dict(orient="records"))

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)



def get_vehicle_data():
    """Fetch and return vehicle data with timestamp"""
    if not fetch_real_time_data():
        raise RuntimeError("Failed to fetch real-time data")
    df = parse_protobuf()
    if df is None:
        raise RuntimeError("Failed to parse protobuf data")
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], unit='s')
    return df
def generate_html_table(df):
    """Generate an HTML table from a DataFrame"""
    return df.to_html(
        classes="table table-striped table-bordered table-hover",
        index=False,
        border=0
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
