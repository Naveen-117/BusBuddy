# In vehicle_positions.py
import requests
from google.transit import gtfs_realtime_pb2
from google.protobuf.json_format import MessageToDict
import json
import time

# URL to fetch vehicle positions
URL = "https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=LdE6xTDPS0mjLc65Kw0sRttaz5iLUMgG"

def fetch_vehicle_positions():
    try:
        fetch_start_time = time.time()
        response = requests.get(URL, timeout=10)
        response.raise_for_status()
        vehicle_positions = gtfs_realtime_pb2.FeedMessage()
        vehicle_positions.ParseFromString(response.content)
        data = []

        feed_header = vehicle_positions.header
        feed_timestamp = feed_header.timestamp if feed_header.HasField("timestamp") else None

        for entity in vehicle_positions.entity:
            vehicle_data = entity.vehicle
            trip = vehicle_data.trip if vehicle_data.HasField("trip") else None
            position = vehicle_data.position if vehicle_data.HasField("position") else None
            vehicle_info = vehicle_data.vehicle if vehicle_data.HasField("vehicle") else None
            
            data.append({
                "entity_id": entity.id,
                "vehicle_id": getattr(vehicle_info, "id", None),
                "trip_id": getattr(trip, "trip_id", None) if trip else None,
                "route_id": getattr(trip, "route_id", None) if trip else None,
                "start_time": getattr(trip, "start_time", None) if trip else None,
                "start_date": getattr(trip, "start_date", None) if trip else None,
                "schedule_relationship": getattr(trip, "schedule_relationship", None) if trip else None,
                "latitude": getattr(position, "latitude", None) if position else None,
                "longitude": getattr(position, "longitude", None) if position else None,
                "speed": getattr(position, "speed", None) if position else None,
                "timestamp": getattr(vehicle_data, "timestamp", None),
                "feed_timestamp": feed_timestamp,
                "fetch_time": fetch_start_time
            })
        
        return data
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = fetch_vehicle_positions()
    print(json.dumps(result))