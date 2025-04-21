import threading, queue, paramiko
from concurrent.futures import Future

MAX_PARALLEL_SSH = 3 # max live ssh sessions
_task_q = queue.Queue()
_workers = []
_pool_started = threading.Event()

def _ssh_worker():
    while True:
        item = _task_q.get()
        if item is None:
            break
        ip, usr, passwd, cmd, fut = item
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(ip, username=usr, password=passwd, banner_timeout=20, timeout=10, auth_timeout=30, allow_agent=False, look_for_keys=False)
            _, stdout, _ = ssh.exec_command(cmd)
            fut.set_result(stdout.read().decode())
        except Exception as e:
            fut.set_exception(e)
        finally:
            ssh.close()
            _task_q.task_done()

def _ensure_pool():
    # start worker threads exactly once (lazy‑start).
    if _pool_started.is_set():
        return
    with threading.Lock():
        if _pool_started.is_set(): # double check in case another thread got here first
            return
        for _ in range(MAX_PARALLEL_SSH):
            t = threading.Thread(target=_ssh_worker, daemon=True)
            t.start()
            _workers.append(t)
        _pool_started.set()
        

def get_router_data_via_ssh(router_ip, username, password, command):
    try:
        _ensure_pool()
        fut = Future()
        _task_q.put((router_ip, username, password, command, fut))
        return fut.result(timeout=20)

    except Exception as e:
        return f"Error: {e}"


def try_get_router(router_ip, username, password):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(router_ip, username=username, password=password, banner_timeout=15)

    ssh.close()

def shutdown():
    # exit threads cleanly
    for _ in _workers:
        _task_q.put(None)
    for t in _workers:
        t.join()
    

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

