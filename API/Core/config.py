import os
from sqlalchemy.engine.url import URL

DATABASE_CONFIG_SERVER = {
    "drivername": "mysql+pymysql",
    "host": "localhost",
    "port": "3307",  
    "username": "mabaszada", 
    "password": "YU3TIV",  
    "database": "Team7",  
}

DATABASE_URL = URL.create(**DATABASE_CONFIG_SERVER)
print(DATABASE_URL)