import yaml
import os
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "config.yaml"

def load_config():
    if not CONFIG_PATH.exists():
        return {}
    
    with open(CONFIG_PATH, "r") as f:
        try:
            return yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading config.yaml: {e}")
            return {}

class ConfigManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance.config = load_config()
        return cls._instance

    def get(self, path, default=None):
        """Get a value by dot-notation path (e.g., 'models.defaults.fast')."""
        keys = path.split(".")
        val = self.config
        for key in keys:
            if isinstance(val, dict):
                val = val.get(key)
            else:
                return default
        return val if val is not None else default

config = ConfigManager()
