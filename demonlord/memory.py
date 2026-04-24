import json
import os
from pathlib import Path
import math
from config import config

# Config-driven memory path
conf_memory_dir = config.get("system.memory_dir", "~/.demonlord")
MEMORY_DIR = Path(os.path.expanduser(conf_memory_dir))
MEMORY_FILE = MEMORY_DIR / "structured_memory.json"
VECTOR_FILE = MEMORY_DIR / "vector_memory.json"

# Ensure directory exists
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

def load_json(path):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except:
            return {}
    return {}

def save_json(path, data):
    path.write_text(json.dumps(data, indent=2))

class MemoryStore:
    def __init__(self):
        self.structured = load_json(MEMORY_FILE)
        self.vectors = load_json(VECTOR_FILE) # Simple list of {text, embedding, metadata}

    def save_structured(self, key, value, category="general"):
        if category not in self.structured:
            self.structured[category] = {}
        self.structured[category][key] = value
        save_json(MEMORY_FILE, self.structured)

    def get_structured(self, key, category="general"):
        return self.structured.get(category, {}).get(key)

    async def add_vector(self, text, metadata=None):
        # We'll use Ollama for embeddings if available
        embedding = await self._get_embedding(text)
        if embedding:
            entry = {
                "text": text,
                "embedding": embedding,
                "metadata": metadata or {}
            }
            if "entries" not in self.vectors:
                self.vectors["entries"] = []
            self.vectors["entries"].append(entry)
            save_json(VECTOR_FILE, self.vectors)

    async def _get_embedding(self, text):
        try:
            import ollama
            # Use a fast embedding model
            response = ollama.embeddings(model="mxbai-embed-large", prompt=text)
            return response["embedding"]
        except:
            # Fallback: very simple hash-based or dummy embedding for local stability
            return [0.0] * 1024 

    def search_vectors(self, query_text, limit=5):
        # In a real app we'd embed the query and do cosine similarity
        # Here we'll do a simple keyword match as fallback if no embeddings
        entries = self.vectors.get("entries", [])
        if not entries: return []
        
        # Simple keyword ranking for demonstration of "Retriever"
        results = []
        for entry in entries:
            score = 0
            for word in query_text.lower().split():
                if word in entry["text"].lower():
                    score += 1
            if score > 0:
                results.append((score, entry))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:limit]]

memory_instance = MemoryStore()
