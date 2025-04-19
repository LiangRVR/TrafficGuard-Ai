from flask import Flask, jsonify, request, session
from flask_cors import CORS
from getRouterData import get_router_data_via_ssh
import sqlite3

app = Flask(__name__)
app.secret_key = "a3f4bfa9d58c0e9f7dc3c7efec9342e1e8f39146b7c5c8cfcf15b6d4088dc0fd" # replace with auto generated one for production
CORS(app)  # Enable CORS to allow requests from the React app

# Router connection details

def get_session_data():
    return session.get('ipAddress'), session.get('username'), session.get('password')

# Commands
commands = {
    "cpu_usage": "top -bn1 | grep 'CPU:'",
    "memory_usage": "free",
    "wireless_clients": "iw dev wlan0 station dump",  # Replace wlan0 with your interface name
    "firewall_rules": "iptables -L -v",
    "uptime_load": "uptime",
    "network_config": "ifconfig",
    "device_list": "cat /tmp/dhcp.leases",
    "log_output": "logread",
    "bandwidth": "cat /proc/net/dev"
}

@app.route('/api/router', methods=['GET', 'POST'])
def get_router():
    req = request.get_json()
    try:
        get_router_data_via_ssh(req["ipAddress"], req["username"], req["password"], "echo \"success?\"")
        session["ipAddress"] = req["ipAddress"]
        session["username"] = req["username"]
        session["password"] = req["password"]

        data = {
            "message": "Connection to the router was successful",
            "status": "Success"
        }
        return (jsonify(data))
    except Exception as e:
        return jsonify({ "message": "Failed to connect", "status": "Error", "error": str(e) })


    

@app.route('/api/data', methods=['GET'])
def get_data():
    print('Request received!')
    try:
        router_ip, username, password = get_session_data()

        # Fetch router data
        network_log = get_router_data_via_ssh(router_ip, username, password, commands["log_output"])
        device_list = get_router_data_via_ssh(router_ip, username, password, commands["device_list"])
        general_info = get_router_data_via_ssh(router_ip, username, password, commands["network_config"])

        # Format the data to send as a JSON response
        data = {
            "message": "Data fetched from the router!",
            "status": "Success",
            "network_log": network_log,
            "device_list": device_list,
            "general_info": general_info,
        }

        # Recreate and save data to the database
        recreate_database()
        save_data_to_db(data)
    except Exception as e:
        data = {
            "message": "Failed to fetch router data.",
            "status": "Error",
            "error": str(e)
        }

    return jsonify(data)


@app.route('/api/logs', methods=['GET'])
def get_logs():
    print('Fetching logs...')
    try:
        router_ip, username, password = get_session_data()

        log_output = get_router_data_via_ssh(router_ip, username, password, commands["log_output"])
        return jsonify({"status": "Success", "logs": log_output})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/devices', methods=['GET'])
def get_devices():
    print('Fetching device list...')
    try:
        router_ip, username, password = get_session_data()

        device_list = get_router_data_via_ssh(router_ip, username, password, commands["device_list"])
        devices = []
        for line in device_list.strip().split("\n"):
            parts = line.split()
            if len(parts) >= 4:
                devices.append({
                    "lease_time": parts[0],
                    "mac_address": parts[1],
                    "ip_address": parts[2],
                    "hostname": parts[3] if len(parts) > 3 else "Unknown",
                })
        return jsonify({"status": "Success", "devices": devices})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/cpu_memory', methods=['GET'])
def get_cpu_memory():
    print('Fetching CPU and memory usage...')
    try:
        router_ip, username, password = get_session_data()

        # Fetch CPU and memory usage data
        cpu_output = get_router_data_via_ssh(router_ip, username, password, commands["cpu_usage"])
        memory_output = get_router_data_via_ssh(router_ip, username, password, commands["memory_usage"])

        # Parse CPU usage data
        cpu_data = {}
        for part in cpu_output.split():
            if "%" in part:
                key, value = part.split("%")
                cpu_data[key] = value

        # Parse Memory usage data
        memory_lines = memory_output.strip().split("\n")
        mem_data = {}
        if len(memory_lines) >= 2:
            headers = memory_lines[0].split()
            values = memory_lines[1].split()
            mem_data = dict(zip(headers, values))

        return jsonify({"status": "Success", "cpu": cpu_data, "memory": mem_data})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/wireless_clients', methods=['GET'])
def get_wireless_clients():
    print('Fetching wireless clients...')
    try:
        router_ip, username, password = get_session_data()

        # Attempt using iwinfo as an alternative
        wireless_clients = get_router_data_via_ssh(router_ip, username, password, "iwinfo wlan0 assoclist")
        if not wireless_clients.strip():  # Fallback if no data is returned
            wireless_clients = get_router_data_via_ssh(router_ip, username, password, "iw dev wlan0 station dump")
        return jsonify({"status": "Success", "wireless_clients": wireless_clients})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/firewall_rules', methods=['GET'])
def get_firewall_rules():
    print('Fetching firewall rules...')
    try:
        router_ip, username, password = get_session_data()
        # Attempt using iptables and fallback to reading firewall config
        firewall_rules = get_router_data_via_ssh(router_ip, username, password, "iptables -L -v")
        if not firewall_rules.strip():  # Fallback if no data is returned
            firewall_rules = get_router_data_via_ssh(router_ip, username, password, "cat /etc/config/firewall")
        return jsonify({"status": "Success", "firewall_rules": firewall_rules})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/uptime_load', methods=['GET'])
def get_uptime_load():
    print('Fetching uptime and load...')
    try:
        router_ip, username, password = get_session_data()

        uptime_load = get_router_data_via_ssh(router_ip, username, password, commands["uptime_load"])
        return jsonify({"status": "Success", "uptime_load": uptime_load})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


@app.route('/api/network_config', methods=['GET'])
def get_network_config():
    print('Fetching network configuration...')
    try:
        router_ip, username, password = get_session_data()

        network_config = get_router_data_via_ssh(router_ip, username, password, commands["network_config"])
        return jsonify({"status": "Success", "network_config": network_config})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})


def recreate_database():
    try:
        conn = sqlite3.connect('router_data.db')
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS router_info")
        cursor.execute("""
            CREATE TABLE router_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT,
                value TEXT
            )
        """)
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        raise e


def save_data_to_db(data):
    try:
        conn = sqlite3.connect('router_data.db')
        cursor = conn.cursor()
        for key, value in data.items():
            cursor.execute("INSERT INTO router_info (key, value) VALUES (?, ?)", (key, str(value)))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        raise e

@app.route('/api/bandwidth', methods=['GET'])
def get_bandwidth():
    print('Fetching bandwidth data...')
    try:
        router_ip, username, password = get_session_data()
        # Execute the bandwidth command via SSH
        bandwidth_output = get_router_data_via_ssh(router_ip, username, password, commands["bandwidth"])

        # Parse and format the output from /proc/net/dev
        lines = bandwidth_output.strip().split("\n")[2:]  # Skip the header lines
        bandwidth_data = []
        for line in lines:
            parts = line.split()
            if len(parts) >= 10:
                bandwidth_data.append({
                    "interface": parts[0].strip(':'),  # Interface name
                    "receive_bytes": int(parts[1]),  # Bytes received
                    "transmit_bytes": int(parts[9])  # Bytes transmitted
                })

        # Return the formatted bandwidth data
        return jsonify({"status": "Success", "bandwidth": bandwidth_data})
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)})



if __name__ == '__main__':
    app.run(debug=True)
