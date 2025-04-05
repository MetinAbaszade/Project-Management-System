from sqlalchemy import create_engine
from Core import DATABASE_URL

engine = create_engine(DATABASE_URL)
try:
    with engine.connect() as connection:
        print("Connected to MySQL database successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")
