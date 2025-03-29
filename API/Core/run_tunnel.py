# run_tunnel.py (utility script)
from sshtunnel import SSHTunnelForwarder

server = SSHTunnelForwarder(
    ('clabsql.clamv.constructor.university', 22),
    ssh_username='mabaszada',
    ssh_password='YU3TIV',
    remote_bind_address=('127.0.0.1', 3306),
    local_bind_address=('127.0.0.1', 3307)
)
server.start()

input("Tunnel running. Press Enter to stop...")
server.stop()
