import asyncio
import os
from agent_base import Agent
from config import config

class AutonomyDemon(Agent):
    def __init__(self, name, bus):
        super().__init__(name, bus)
        # Load from config
        self.watched_configs = config.get("autonomy.watched_directories", [])
        self.interval = config.get("autonomy.check_interval_seconds", 10)
        self.last_mtimes = {}
        
        # Format and expand user paths
        self.watches = []
        for item in self.watched_configs:
            if isinstance(item, str):
                self.watches.append({"path": os.path.expanduser(item), "pattern": "*"})
            elif isinstance(item, dict):
                path = item.get("path")
                pattern = item.get("pattern", "*")
                if path:
                    self.watches.append({"path": os.path.expanduser(path), "pattern": pattern})

    async def run(self):
        print(f"\n[AUTONOMY DEMON] Monitoring {len(self.watches)} paths at {self.interval}s intervals...")
        while True:
            await asyncio.sleep(self.interval)
            for watch in self.watches:
                path = watch["path"]
                if os.path.exists(path):
                    try:
                        mtime = os.path.getmtime(path)
                        if mtime > self.last_mtimes.get(path, 0):
                            print(f"[AUTONOMY DEMON] Change detected in {path}")
                            self.last_mtimes[path] = mtime
                            await self.broadcast(f"FILE_CHANGE:{path}", {"path": path, "type": "event", "pattern": watch["pattern"]})
                    except Exception as e:
                        print(f"[AUTONOMY DEMON] Error checking {path}: {e}")

    async def handle(self, msg):
        task = msg["task"]
        context = msg["context"]
        action = context.get("action")
        
        if action == "watch":
            path = os.path.expanduser(context.get("path", task))
            pattern = context.get("pattern", "*")
            exists = any(w["path"] == path for w in self.watches)
            if not exists:
                self.watches.append({"path": path, "pattern": pattern})
                print(f"[AUTONOMY DEMON] Now watching: {path} with pattern {pattern}")
        
        elif action == "unwatch":
            path = os.path.expanduser(context.get("path", task))
            self.watches = [w for w in self.watches if w["path"] != path]
            print(f"[AUTONOMY DEMON] Stopped watching: {path}")
        
        print(f"\n[AUTONOMY DEMON] Task received: {task}")
