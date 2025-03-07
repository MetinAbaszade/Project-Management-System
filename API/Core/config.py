import os
from sqlalchemy.engine.url import URL

DATABASE_CONFIG = {
    "drivername": "mysql+pymysql",
    "host": "localhost",
    "port": "3306",
    "username": "root",
    "password": "101228",
    "database": "project_management_system",
}

DATABASE_URL = URL.create(**DATABASE_CONFIG)
print(DATABASE_URL)
