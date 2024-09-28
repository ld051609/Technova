
from flask import Flask, request, jsonify
import requests
import os
from function import haversine
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)

# Connect to MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)  
db = client.crime_data
crime_collection = db.crimes

# Replace this with your actual Google Maps API key
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

@app.route('/get_directions', methods=['POST'])
def get_directions():
    data = request.get_json()
    origin_lat = data.get('origin_lat')
    origin_lng = data.get('origin_lng')
    destination = data.get('destination')

    # Construct the Google Maps Directions API URL
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin_lat},{origin_lng}&destination={destination}&key={GOOGLE_MAPS_API_KEY}"

    # Send request to Google Maps Directions API
    response = requests.get(url)
        

    if response.status_code == 200:
        directions_data = response.json()
        return jsonify(directions_data)
    else:
        return jsonify({'error': 'Unable to fetch directions'}), 500
    
@app.route('/check_crime', methods=['POST'])
def check_crime():
    data = request.get_json()
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')
    detection_radius = 0.5  # 500 m radius

    if user_lat is None or user_lon is None:
        return jsonify({"error": "Invalid input"}), 400

    # Query MongoDB for intersections within the detection radius
    nearby_crimes = []
    unique_crime_locations = set()  # To track unique crime records by NearestIntersectionLocation

    for record in crime_collection.find():
        crime_lat = record['Latitude']
        crime_lon = record['Longitude']
        distance = haversine(user_lat, user_lon, crime_lat, crime_lon)
        
        if distance < detection_radius:
            # Check the crime rating
            crime_rating = record.get('rating', 'Low')  # Default to 'Low' if not specified

            # Add the record only if the rating is 'Moderate' or 'High'
            if crime_rating in ['Moderate', 'High']:
                # Get the NearestIntersectionLocation
                intersection_location = record.get('NearestIntersectionLocation', 'Unknown')

                # Check if this intersection location has already been added
                if intersection_location not in unique_crime_locations:
                    unique_crime_locations.add(intersection_location)  # Add to unique set
                    
                    # Convert ObjectId to string for JSON serialization
                    record_id = str(record['_id'])
                    
                    # Add the relevant crime data (including street/intersection and rating)
                    crime_info = {
                        '_id': record_id,
                        'NearestIntersectionLocation': intersection_location,
                        'rating': crime_rating,
                        'crime_rate': record.get('crime_rate', 0.0),
                        'Latitude': crime_lat,
                        'Longitude': crime_lon,
                        'distance': distance
                    }
                    nearby_crimes.append(crime_info)

    # Respond with detailed nearby crime data
    if nearby_crimes:
        return jsonify({
            'status': 'danger',
            'nearby_crimes': nearby_crimes
        })
    
    return jsonify({'status': 'safe'})


if __name__ == '__main__':
    app.run(debug=True)
