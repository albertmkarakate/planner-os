import asyncio
from bus import MessageBus

class Agent:
    def __init__(self, name, bus):
        self.name = name
        self.bus = bus

    async def send(self, receiver, task, context=None):
        await self.bus.send({
            "sender": self.name,
            "receiver": receiver,
            "task": task,
            "context": context or {}
        })

    async def broadcast(self, task, context=None):
        await self.bus.send({
            "sender": self.name,
            "receiver": "all",
            "task": task,
            "context": context or {}
        })

    async def run(self):
        while True:
            msg = await self.bus.receive(self.name)
            await self.handle(msg)

    async def handle(self, msg):
        pass
