import socket
import ssl

db_host = "db.jqysknhobtpcbyyltnfc.supabase.co"
db_port = 5432

print(f"Testing direct TCP connection to Supabase PostgreSQL: {db_host}:{db_port}...")

try:
    sock = socket.create_connection((db_host, db_port), timeout=10)
    print(" -> SUCCESS! TCP connection to Supabase PostgreSQL port 5432 established.")
    sock.close()
except Exception as e:
    print(f" -> FAILED: {e}")
