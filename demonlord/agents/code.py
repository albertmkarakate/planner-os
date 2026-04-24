from agent_base import Agent

class CodeDemon(Agent):
    async def handle(self, msg):
        task = msg["task"]
        print(f"\n[CODE DEMON] Processing coding task: {task}")
        
        # Delegate to model to get code
        await self.send("model", f"Write Python code for: {task}")
        # Note: In a smarter version, this agent would then save the code to a file using SystemDemon
