import os
from sqlalchemy.engine.url import URL

# DATABASE_CONFIG_LOCALHOST = {
#     "drivername": "mysql+pymysql",
#     "host": "localhost",  # Connect via SSH tunnel
#     "port": "3307",  # The forwarded port from SSH tunnel
#     "username": "mabaszada",  # Your university MySQL username
#     "password": "YU3TIV",  # Your MySQL password
#     "database": "Team7",  # Your database name
# }

# DATABASE_CONFIG_LOCALHOST = {
#     "drivername": "mysql+pymysql",
#     "host": "localhost",
#     "port": "3306",
#     "username": "gbabayev",  
#     "password": "1892",  
#     "database": "ProjectManagement",  
# }

DATABASE_CONFIG_LOCALHOST = {
     "drivername": "mysql+pymysql",
     "host": "localhost",
     "port": "3306",
     "username": "gabilmajidov",  
     "password": "11221122",  
     "database": "Taskup",  
}

DATABASE_CONFIG_SERVER = {
    "drivername": "mysql+pymysql",
    "host": "localhost",  # Connect via SSH tunnel
    "port": "3306",  # The forwarded port from SSH tunnel
    "username": "mabaszada",  # Your university MySQL username
    "password": "YU3TIV",  # Your MySQL password
    "database": "Team7",  # Your database name
}


#DATABASE_CONFIG_LOCALHOST = {
#     "drivername": "mysql+pymysql",
#     "host": "localhost",
#     "port": "3306",
#     "username": "rafa",  
#     "password": "Lolki20142017!",  
#     "database": "Taskup",  
# }

DATABASE_URL = URL.create(**DATABASE_CONFIG_LOCALHOST)
print(DATABASE_URL)