import asyncio

class MessageBus:
    def __init__(self):
        self.queues = {}

    def register(self, name):
        self.queues[name] = asyncio.Queue()

    async def send(self, message):
        receiver = message["receiver"]
        if receiver == "all":
            for name, queue in self.queues.items():
                if name != message["sender"]:
                    # Create a copy for broadcast
                    msg_copy = message.copy()
                    msg_copy["receiver"] = name
                    await queue.put(msg_copy)
        elif receiver in self.queues:
            await self.queues[receiver].put(message)

    async def receive(self, name):
        return await self.queues[name].get()
