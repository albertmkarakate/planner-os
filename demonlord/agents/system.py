from agent_base import Agent
from tools import run_shell, get_system_load, list_processes, check_package, get_gui_info, take_screenshot

class SystemDemon(Agent):
    async def handle(self, msg):
        task = msg["task"]
        context = msg["context"]
        action = context.get("action", "execute")
        
        print(f"\n[SYSTEM DEMON] Task: {task} | Action: {action}")
        
        if action == "monitor":
            load = get_system_load()
            await self.send("supreme", f"System Load: {load}", {"load": load, "type": "status"})
            
        elif action == "gui_info":
            info = get_gui_info()
            await self.send("supreme", f"GUI Context: {info['server'].upper()} | Active: {info['active']}", {"result": info})

        elif action == "screenshot":
            path = task if task and "/" in task else "/tmp/demon_shot.png"
            res = take_screenshot(path)
            if res["code"] == 0:
                await self.send("supreme", f"Screenshot captured to {path}", {"path": path, "status": "success"})
            else:
                await self.send("supreme", f"Screenshot failed: {res['stderr']}", {"status": "error", "error": res['stderr']})

        elif action == "package_check":
            res = check_package(task)
            await self.send("supreme", f"Package Status for {task}: {res['stdout']}", {"result": res})
            
        elif action == "process_list":
            res = list_processes(task if task != "list" else None)
            await self.send("supreme", f"Active Processes: {res[:200]}...", {"result": res})
            
        else:
            # Standard execution
            if any(bad in task for bad in ["rm -rf /", "mkfs", "> /dev/sda"]):
                 print("[SYSTEM DEMON] CRITICAL: Recursive root deletion blocked.")
                 return

            res = run_shell(task)
            output = res["stdout"] + res["stderr"]
            print(f"[SYSTEM DEMON] Command Output Received ({len(output)} chars)")
            
            # Save to memory
            await self.send("memory", task, {"output": output, "type": "system_exec", "action": "store"})
            
            # Respond to requester
            if msg["sender"] != "user":
                await self.send(msg["sender"], f"System execution complete: {output[:100]}...", {"result": res})
