import sys
import os
from pathlib import Path
import requests
import pandas as pd
from google.protobuf.json_format import MessageToDict

# ==============================================
# 1. FALLBACK IMPORT SYSTEM FOR GTFS BINDINGS
# ==============================================

def setup_gtfs_imports():
    """
    Robust import handling for GTFS realtime bindings with multiple fallbacks:
    1. First try standard package import
    2. Fallback to direct protobuf import
    3. Final fallback to locally compiled proto file
    """
    # Add venv site-packages explicitly (Windows fix)
    venv_path = Path("venv/Lib/site-packages").resolve()
    if str(venv_path) not in sys.path:
        sys.path.insert(0, str(venv_path))

    try:
        # Primary import attempt
        from gtfs_realtime_bindings import gtfs_realtime_pb2
        print("✅ Using installed gtfs_realtime_bindings package")
        return gtfs_realtime_pb2
    except ImportError:
        try:
            # First fallback: direct protobuf import
            from google.transit import gtfs_realtime_pb2
            print("⚠️ Using google.transit fallback import")
            return gtfs_realtime_pb2
        except ImportError:
            try:
                # Second fallback: local compiled proto
                from gtfs_realtime_pb2 import FeedMessage
                print("⚠️ Using locally compiled gtfs_realtime.proto")
                
                # Create mock module for compatibility
                mock_pb2 = type('', (), {'FeedMessage': FeedMessage})()
                return mock_pb2
            except ImportError:
                raise ImportError(
                    "Could not import GTFS realtime bindings.\n"
                    "Please either:\n"
                    "1. Install package: pip install gtfs-realtime-bindings\n"
                    "2. Or compile manually: \n"
                    "   pip install protobuf\n"
                    "   curl -O https://raw.githubusercontent.com/google/transit/master/gtfs-realtime/proto/gtfs-realtime.proto\n"
                    "   protoc --python_out=. gtfs-realtime.proto"
                )

# Initialize GTFS bindings
gtfs_realtime_pb2 = setup_gtfs_imports()

# ==============================================
# 2. MAIN APPLICATION CODE (UNCHANGED)
# ==============================================

API_URL = "https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=LdE6xTDPS0mjLc65Kw0sRttaz5iLUMgG"

def fetch_real_time_data():
    """Fetch real-time vehicle position data from Delhi's API."""
    response = requests.get(API_URL)
    if response.status_code == 200:
        with open("vehicle_positions.pb", "wb") as f:
            f.write(response.content)
        print("✅ Successfully downloaded vehicle_positions.pb")
        return True
    else:
        print(f"❌ Failed to fetch data (HTTP {response.status_code})")
        return False

def parse_protobuf():
    """Parse the .pb file into a pandas DataFrame."""
    try:
        feed = gtfs_realtime_pb2.FeedMessage()
        
        with open("vehicle_positions.pb", "rb") as f:
            feed.ParseFromString(f.read())

        vehicle_data = []
        for entity in feed.entity:
            if entity.HasField("vehicle"):
                vehicle = entity.vehicle
                trip = vehicle.trip

                vehicle_data.append({
                    "Entity ID": entity.id,
                    "Vehicle ID": vehicle.vehicle.id,
                    "Trip ID": trip.trip_id,
                    "Route ID": trip.route_id,
                    "Start Time": trip.start_time,
                    "Start Date": trip.start_date,
                    "Schedule Relationship": trip.schedule_relationship,
                    "Latitude": vehicle.position.latitude,
                    "Longitude": vehicle.position.longitude,
                    "Speed": vehicle.position.speed,
                    "Timestamp": vehicle.timestamp
                })

        df = pd.DataFrame(vehicle_data)
        df.to_csv("real_time_vehicle_positions.csv", index=False)
        print("✅ Converted .pb to CSV: real_time_vehicle_positions.csv")
        return df

    except Exception as e:
        print(f"❌ Error parsing protobuf: {str(e)}")
        return None

if __name__ == "__main__":
    if fetch_real_time_data():
        df = parse_protobuf()
        if df is not None:
            print("\nFirst 5 vehicles:")
            print(df.head())