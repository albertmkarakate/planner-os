import asyncio
import sys
import os

# Add the current directory to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bus import MessageBus
from agents.supreme import SupremeDemon
from agents.reasoning import ReasoningDemon
from agents.code import CodeDemon
from agents.system import SystemDemon
from agents.memory_agent import MemoryDemon
from agents.model_agent import ModelDemon
from agents.tool_agent import ToolDemon
from agents.autonomy import AutonomyDemon

async def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", type=str, help="Single task to execute")
    args = parser.parse_args()

    bus = MessageBus()

    # Instantiate Agents
    agents = [
        SupremeDemon("supreme", bus),
        ReasoningDemon("reasoning", bus),
        CodeDemon("code", bus),
        SystemDemon("system", bus),
        MemoryDemon("memory", bus),
        ModelDemon("model", bus),
        ToolDemon("tools", bus),
        AutonomyDemon("autonomy", bus),
    ]

    # Register Agents on the Bus
    for agent in agents:
        bus.register(agent.name)

    # Start Agent Loops
    tasks = [asyncio.create_task(agent.run()) for agent in agents]

    if args.task:
        print(f"Executing CLI Task: {args.task}")
        await bus.send({
            "sender": "cli",
            "receiver": "supreme",
            "task": args.task,
            "context": {}
        })
        # Wait for agents to process (this is a simple wait for demo purposes)
        await asyncio.sleep(5)
        print("CLI Task processing complete.")
        return

    print("="*40)
    print("DEMON LORD ORCHESTRATION SYSTEM (DLOS)")
    print("="*40)
    print("Status: All Demon Lords are Online.")
    print("Enter 'exit' to quit.")

    # Main user interaction loop
    while True:
        try:
            # We use run_in_executor to not block the event loop with input()
            user_task = await asyncio.get_event_loop().run_in_executor(None, lambda: input("\n>>> "))
            
            if user_task.lower() in ["exit", "quit"]:
                print("Dematerializing agents...")
                for task in tasks:
                    task.cancel()
                break

            if not user_task.strip():
                continue

            await bus.send({
                "sender": "user",
                "receiver": "supreme",
                "task": user_task,
                "context": {}
            })
            
            # Wait a bit for agents to process
            await asyncio.sleep(1)
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in main loop: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
