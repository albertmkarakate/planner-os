from agent_base import Agent

class SupremeDemon(Agent):
    async def handle(self, msg):
        task = msg["task"]
        context = msg["context"]
        
        # Don't respond to our own broadcasts
        if msg["sender"] == self.name: return
        
        print(f"\n[SUPREME DEMON LORD] Evaluating: {task}")

        # Check for events
        if context.get("type") == "event":
            print(f"[SUPREME DEMON LORD] Analyzing external event: {task}")
            # Delegate to reasoning to decide what to do with the event
            await self.send("reasoning", task, context)
            return

        # Core Routing
        if "install" in task or "system" in task or "run" in task:
            await self.send("system", task, context)
        elif "code" in task or "file" in task or "script" in task:
            await self.send("code", task, context)
        elif "remember" in task or "search memory" in task:
            await self.send("memory", task, {"action": "query" if "search" in task else "store"})
        elif "broadcast" in task.lower():
            clean_task = task.lower().replace("broadcast", "").strip()
            await self.broadcast(clean_task, {"type": "memo"})
        else:
            # Default to reasoning/planning for complex tasks
            await self.send("reasoning", task, context)
