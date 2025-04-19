import paramiko


def get_router_data_via_ssh(router_ip, username, password, command):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(router_ip, username=username, password=password, banner_timeout=10)
        stdin, stdout, stderr = ssh.exec_command(command)
        output = stdout.read().decode()

        ssh.close()
        return output
    except Exception as e:
        return f"Error: {e}"


# Variables
router_ip = "192.168.1.1"
username = "root"
password = "Paulo@123"
get_log = "logread"
get_device_list = "cat /tmp/dhcp.leases"
get_general_info = "cat /proc/net/dev"


# Get data
network_log = get_router_data_via_ssh(router_ip, username, password, get_log)
device_list = get_router_data_via_ssh(router_ip, username, password, get_device_list)

