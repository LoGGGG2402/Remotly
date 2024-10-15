import requests
import socket
import platform
import uuid
import time
import logging
import psutil
import json
import threading
import cpuinfo  # type: ignore # Add this import at the top of the file

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Server configuration
SERVER_URL = "http://10.37.129.2:3000/api/agent"  # Updated URL
AGENT_PORT = 5000  # Port for the agent to listen on

def get_computer_info():
    cpu_freq = psutil.cpu_freq()
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "hostname": socket.gethostname(),
        "ip_address": next((ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")), "127.0.0.1"),
        "mac_address": ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0,2*6,2)][::-1]),
        "os": platform.system(),
        "os_version": platform.version(),
        "cpu_name": cpuinfo.get_cpu_info()['brand_raw'],  # Add this line to get the CPU name
        "cpu_count": psutil.cpu_count(logical=False),
        "cpu_threads": psutil.cpu_count(logical=True),
        "cpu_freq_current": cpu_freq.current if cpu_freq else None,
        "cpu_freq_min": cpu_freq.min if cpu_freq else None,
        "cpu_freq_max": cpu_freq.max if cpu_freq else None,
        "memory": mem.total,
        "ram_available": mem.available,
        "disk_total": disk.total,
        "disk_used": disk.used,
        "disk_free": disk.free
    }

def communicate_with_server(endpoint, data):
    try:
        response = requests.post(f"{SERVER_URL}/{endpoint}", json=data)
        response.raise_for_status()
        logging.info(f"Successfully communicated with the server: {endpoint}")
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Failed to communicate with the server: {endpoint} - {e}")
        return None

def handle_command(command):
    if command == 'get_system_info':
        return json.dumps(get_computer_info())
    elif command == 'get_process_list':
        return json.dumps([proc.info for proc in psutil.process_iter(['pid', 'name', 'username'])])
    elif command == 'get_network_connections':
        return json.dumps([{
            'fd': conn.fd,
            'family': conn.family,
            'type': conn.type,
            'laddr': conn.laddr._asdict() if conn.laddr else None,
            'raddr': conn.raddr._asdict() if conn.raddr else None,
            'status': conn.status,
            'pid': conn.pid
        } for conn in psutil.net_connections()])
    else:
        return json.dumps({"error": "Unknown command"})

def start_command_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('0.0.0.0', AGENT_PORT))
        s.listen()
        logging.info(f"Agent listening for commands on port {AGENT_PORT}")
        while True:
            conn, addr = s.accept()
            with conn:
                logging.info(f"Connected by {addr}")
                data = conn.recv(1024)
                if not data:
                    continue
                command = data.decode('utf-8').strip()
                logging.info(f"Received command: {command}")
                response = handle_command(command)
                conn.sendall(response.encode('utf-8'))

def main():
    computer_info = get_computer_info()
    
    while not communicate_with_server("connect", computer_info):
        logging.info("Retrying connection in 60 seconds...")
        time.sleep(60)

    command_thread = threading.Thread(target=start_command_server, daemon=True)
    command_thread.start()

    while True:
        if communicate_with_server(f"update-info/{computer_info['mac_address']}", computer_info):
            logging.info("Computer info updated successfully")
        else:
            logging.warning("Failed to update computer info")
        
        time.sleep(300)

if __name__ == "__main__":
    main()
