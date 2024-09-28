from flask import Flask, request, jsonify
import requests
import os
from function import haversine
from pymongo import MongoClient
from dotenv import load_dotenv
import polyline  # Install the polyline package using pip
from twilio.rest import Client

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
        # Get the first route
        route = directions_data.get('routes', [])[0]

        # Get the overview_polyline and destination location
        overview_polyline = route.get('overview_polyline', {}).get('points')
        destination_location = route['legs'][0]['end_location']
        
        # Fetch nearby crimes along the route
        nearby_crimes = fetch_nearby_crimes_along_route(overview_polyline)

        return jsonify({
            'overview_polyline': overview_polyline,
            'destination_lat': destination_location['lat'],
            'destination_lng': destination_location['lng'],
            'nearby_crimes': nearby_crimes
        })
    else:
        return jsonify({'error': 'Unable to fetch directions'}), 500


def fetch_nearby_crimes_along_route(overview_polyline):
    # Decode the polyline to get a list of points along the route
    route_points = polyline.decode(overview_polyline)
    
    nearby_crimes = []
    detection_radius = 0.1  # 100 m radius
    unique_crime_ids = set()  # To keep track of unique crime records by ID

    # Check crimes for each point along the route
    for point in route_points:
        lat, lng = point
        
        # Query MongoDB for crimes within the detection radius
        for record in crime_collection.find():
            crime_lat = record['Latitude']
            crime_lon = record['Longitude']
            distance = haversine(lat, lng, crime_lat, crime_lon)

            # Check if the crime is within the detection radius
            if distance < detection_radius:
                record_id = str(record['_id'])  # Convert ObjectId to string for JSON serialization
                
                # Add to unique crimes only if not already included
                if record_id not in unique_crime_ids:
                    unique_crime_ids.add(record_id)
                    crime_info = {
                        '_id': record_id,
                        'NearestIntersectionLocation': record.get('NearestIntersectionLocation', 'Unknown'),
                        'rating': record.get('rating', 'Low'),
                        'crime_rate': record.get('crime_rate', 0.0),
                        'Latitude': crime_lat,
                        'Longitude': crime_lon,
                        'distance': distance
                    }
                    nearby_crimes.append(crime_info)

    return nearby_crimes

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


# Twilio configuration
account_sid = os.getenv("TWILIO_ACCOUNT_SID")  
auth_token = os.getenv("TWILIO_AUTH_TOKEN")    
twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER") 

client = Client(account_sid, auth_token)

@app.route('/share_location', methods=['POST'])
def share_location():
    try:
        # Extract latitude and longitude from the request
        data = request.get_json()
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        # List of emergency contacts
        emergency_contacts = ['+16477653730', '+0987654321']  

        if not latitude or not longitude:
            return jsonify({"error": "Latitude and Longitude are required"}), 400

        # Message to send
        message_body = f"Emergency! User is located at: https://maps.google.com/?q={latitude},{longitude}"

        # Send the message to all emergency contacts
        for contact in emergency_contacts:
            message = client.messages.create(
                body=message_body,
                from_=twilio_phone_number,
                to=contact
            )

        return jsonify({"message": "Location shared successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_address_from_coords(lat, lon):
    try:
        url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={GOOGLE_MAPS_API_KEY}'
        response = requests.get(url)
        data = response.json()
        if data['status'] == 'OK':
            # Extract the formatted address from the response
            return data['results'][0]['formatted_address']
        else:
            return None
    except Exception as e:
        print(f"Error fetching address: {e}")
        return None

@app.route('/form', methods=['POST'])
def submit_form():
    try:
        # Get data from request
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        crime = data.get('crime')

        if not lat or not lon or not crime:
            return jsonify({"error": "Missing required data"}), 400
        
        # Get address from coordinates
        address = get_address_from_coords(lat, lon)
        if not address:
            return jsonify({"error": "Could not retrieve address from coordinates"}), 400

        # Prepare document for MongoDB
        report = {
            "latitude": lat,
            "longitude": lon,
            "crime": crime,
            "address": address
        }

        # Insert into MongoDB
        crime_collection.insert_one(report)  # Corrected to use crime_collection

        return jsonify({"message": "Form is submitted and data is stored!"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred during form submission."}), 500

if __name__ == '__main__':
    app.run(debug=True)
