import os
from agent_base import Agent
from models import ask_model

class ModelDemon(Agent):
    async def handle(self, msg):
        prompt = msg["task"]
        context = msg["context"]
        quality_hint = context.get("quality") # Optional: "fast", "standard", "heavy", "code"
        
        print(f"\n[MODEL DEMON] Routing intelligent request: {prompt[:60]}...")
        if quality_hint:
            print(f"[MODEL DEMON] Quality hint provided: {quality_hint}")
        
        try:
            result = await ask_model(prompt, quality_hint=quality_hint)
        except Exception as e:
            result = f"CRITICAL: Intelligence routing failed. Error: {str(e)}"

        print(f"\n[MODEL DEMON] Processing Complete.")
        
        # Send result back to requester
        await self.send(msg["sender"], result, {
            "type": "model_response", 
            "original_task": prompt,
            "agent_source": "ModelDemon"
        })
        
        print(f"[MODEL DEMON] Intelligence Result sent to {msg['sender']}.")
