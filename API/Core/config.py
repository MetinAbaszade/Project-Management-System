import os
from sqlalchemy.engine.url import URL

DATABASE_CONFIG_LOCALHOST = {
    "drivername": "mysql+pymysql",
    "host": "localhost",
    "port": "3306",
    "username": "gabilmajidov",  
    "password": "11221122",  
    "database": "Taskup",  
}

DATABASE_URL = URL.create(**DATABASE_CONFIG_LOCALHOST)
print(DATABASE_URL)
