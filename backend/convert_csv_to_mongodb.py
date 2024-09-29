import pandas as pd
from pymongo import MongoClient

# Load data from CSV file
csv_file_path = './dataset/crime_rate.csv'
df = pd.read_csv(csv_file_path)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/') 
db = client.crime_data 
crime_collection = db.crimes  


crime_records = df.to_dict('records')
crime_collection.insert_many(crime_records) 

print("Data imported successfully!")
