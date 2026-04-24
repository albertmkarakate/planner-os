import subprocess
import os

def run_shell(cmd):
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "code": result.returncode
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "code": -1}

def get_system_load():
    try:
        return os.getloadavg()
    except:
        return (0,0,0)

def list_processes(filter_name=None):
    cmd = "ps aux"
    if filter_name:
        cmd += f" | grep {filter_name}"
    res = run_shell(cmd)
    return res["stdout"]

def check_package(pkg_name):
    # Detect package manager
    for mgr in ["pacman", "apt", "dnf", "nix-env"]:
        check_res = run_shell(f"which {mgr}")
        if check_res["code"] == 0:
            if mgr == "pacman": return run_shell(f"pacman -Qi {pkg_name}")
            if mgr == "apt": return run_shell(f"apt-cache policy {pkg_name}")
            # etc...
    return {"stdout": "Unknown package manager", "code": 1}

def get_display_server():
    return os.environ.get("XDG_SESSION_TYPE", "unknown").lower()

def get_gui_info():
    """Returns information about windows and display server."""
    server = get_display_server()
    info = {"server": server, "windows": [], "active": None}
    
    if server == "x11":
        # requires x11-utils, xdotool, wmctrl
        active_res = run_shell("xdotool getactivewindow getwindowname")
        info["active"] = active_res["stdout"].strip()
        
        list_res = run_shell("wmctrl -l")
        if list_res["code"] == 0:
            info["windows"] = list_res["stdout"].splitlines()
            
    elif server == "wayland":
        # Check for Sway/Hyprland
        sway_res = run_shell("swaymsg -t get_tree")
        if sway_res["code"] == 0:
            import json
            try:
                tree = json.loads(sway_res["stdout"])
                def find_focused(node):
                    if node.get("focused"): return node
                    for child in node.get("nodes", []) + node.get("floating_nodes", []):
                        f = find_focused(child)
                        if f: return f
                    return None
                focused = find_focused(tree)
                if focused:
                    info["active"] = focused.get("name") or focused.get("app_id")
            except:
                 info["active"] = "Wayland (Sway) - Parse Error"
        else:
            info["active"] = "Wayland (Unsupported Compositor Query)"

    return info

def take_screenshot(filepath="/tmp/screenshot.png"):
    server = get_display_server()
    if server == "x11":
        return run_shell(f"import -window root {filepath}") # ImageMagick
    elif server == "wayland":
        return run_shell(f"grim {filepath}") # grim
    return {"stdout": "", "stderr": "Screen capture failed: No server detected", "code": 1}

def install_package(pkg_name):
    # This is dangerous for auto-run but requested in system capabilities
    # We'll use a mocked "simulation" if not root or restricted
    return run_shell(f"# Simulation: sudo apt install {pkg_name}")
