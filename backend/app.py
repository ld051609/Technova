import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()

app = Flask(__name__)

def get_directions(origin_lat, origin_lng, destination):
    directions_url = "https://maps.googleapis.com/maps/api/directions/json"
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": destination,
        "key": api_key
    }

    response = requests.get(directions_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['routes']:
            return data['routes'][0]
        else:
            return None
    else:
        print(f"Error: {response.status_code}")
        return None

@app.route('/get_directions', methods=['POST'])
def get_route():
    data = request.get_json()
    origin_lat = data.get('origin_lat') 
    origin_lng = data.get('origin_lng')
    destination = data.get('destination')

    if origin_lat is None or origin_lng is None or not destination:
        return jsonify({"error": "Please provide origin latitude, origin longitude, and destination."}), 400

    directions = get_directions(origin_lat, origin_lng, destination)
    if directions:
        return jsonify(directions), 200
    else:
        return jsonify({"error": "Could not retrieve directions."}), 500

if __name__ == '__main__':
    app.run(debug=True)
