from agent_base import Agent
from memory import memory_instance

class MemoryDemon(Agent):
    async def handle(self, msg):
        task = msg["task"]
        context = msg["context"]
        action = context.get("action", "store") # store, query, save_structured, get_structured
        
        print(f"\n[MEMORY DEMON] Action: {action} | Context: {str(context)[:50]}...")
        
        if action == "store":
            await memory_instance.add_vector(task, context.get("metadata"))
            print("[MEMORY DEMON] Vector memory committed.")
            
        elif action == "query":
            results = memory_instance.search_vectors(task)
            print(f"[MEMORY DEMON] Query results found: {len(results)}")
            # In a real system, we'd send these results back to the requester
            await self.send(msg["sender"], f"Memory retrieval for '{task}': " + str(results), {"results": results, "type": "memory_result"})
            
        elif action == "save_structured":
            category = context.get("category", "general")
            key = context.get("key", task)
            value = context.get("value")
            memory_instance.save_structured(key, value, category)
            print(f"[MEMORY DEMON] Structured memory saved under '{category}/{key}'.")
            
        elif action == "get_structured":
            category = context.get("category", "general")
            key = context.get("key", task)
            val = memory_instance.get_structured(key, category)
            await self.send(msg["sender"], f"Retrieve {category}/{key}: {val}", {"value": val, "type": "memory_result"})
