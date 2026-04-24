from agent_base import Agent
from tools import run_shell

class ToolDemon(Agent):
    async def handle(self, msg):
        task = msg["task"]
        print(f"\n[TOOL DEMON] Deploying tool for task: {task}")
        
        # Simple tool mapping
        if "git" in task:
            output = run_shell(f"git {task.replace('git ', '')}")
        elif "list" in task:
            output = run_shell("ls -la")
        else:
            output = run_shell(task)
            
        print(f"[TOOL DEMON] Tool output captured.")
        await self.send("memory", f"tool_execution_{task}", {"output": output})
