import json
import asyncio
from agent_base import Agent

PLAN_PROMPT = """You are the Reasoning Demon. Your job is to decompose the user's task into a structured execution plan.
Return ONLY a JSON object with the following structure:
{
  "task": "Original task description",
  "steps": [
    {
      "id": 1,
      "agent": "system|code|tools|memory|model",
      "task": "Specific instruction for this agent",
      "depends_on": []
    }
  ]
}
"""

class ReasoningDemon(Agent):
    def __init__(self, name, bus):
        super().__init__(name, bus)
        self.active_plans = {}

    async def handle(self, msg):
        sender = msg["sender"]
        task = msg["task"]
        context = msg["context"]

        print(f"\n[REASONING DEMON] Factoring logic for: {task[:50]}...")

        # If it's a response from the model, it might be a plan we requested
        if sender == "model" and context.get("type") == "model_response":
            await self._process_plan(task)
            return

        # If it's from supreme or user, we generate a plan
        if sender in ["supreme", "user", "cli"]:
            print(f"[REASONING DEMON] Generating execution graph for: {task}")
            # Request plan from model
            prompt = f"{PLAN_PROMPT}\nTask: {task}"
            await self.send("model", prompt, {"type": "plan_request"})
            return

        # Handle broadcasts or other messages if needed
        if context.get("type") == "event":
            print(f"[REASONING DEMON] Evaluating event: {task}")
            # Could trigger a re-plan or a specific action

    async def _process_plan(self, plan_text):
        try:
            # Clean possible markdown block
            if "```json" in plan_text:
                plan_text = plan_text.split("```json")[1].split("```")[0].strip()
            elif "```" in plan_text:
                plan_text = plan_text.split("```")[1].split("```")[0].strip()
            
            plan = json.loads(plan_text)
            steps = plan.get("steps", [])
            print(f"[REASONING DEMON] Plan accepted with {len(steps)} steps.")

            # Simple sequential execution for now (the graph part can be expanded)
            for step in steps:
                agent = step.get("agent")
                sub_task = step.get("task")
                print(f"[REASONING DEMON] Dispatching Step {step.get('id')}: [{agent}] {sub_task}")
                await self.send(agent, sub_task, {"step_id": step.get("id"), "plan_ref": plan.get("task")})
                # In a more advanced version, we would wait for Step 1 to finish before Step 2 if depends_on is set
                # But for this async bus, we'll fire them or wait for feedback
                await asyncio.sleep(0.1) 

        except Exception as e:
            print(f"[REASONING DEMON] Failed to parse plan: {e}")
            print(f"[REASONING DEMON] Raw output was: {plan_text[:100]}...")
