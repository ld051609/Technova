import pandas as pd
from pymongo import MongoClient

# Load data from CSV file
csv_file_path = './dataset/crime_rate.csv'  # Replace with your CSV file path
df = pd.read_csv(csv_file_path)

# Connect to MongoDB
client = MongoClient('mongodb+srv://laniD:12345@cluster0.i5af7yo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')  # Replace with your MongoDB connection string
db = client.crime_data  # Create or switch to the 'crime_data' database
crime_collection = db.crimes  # Create or switch to the 'crimes' collection

# Convert DataFrame to dictionary format and insert into MongoDB
crime_records = df.to_dict('records')  # Convert DataFrame to a list of dictionaries
crime_collection.insert_many(crime_records)  # Insert records into the collection

print("Data imported successfully!")
