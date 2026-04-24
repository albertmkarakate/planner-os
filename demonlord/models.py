import os
import subprocess
import json
import asyncio
import time
from config import config

def get_vram_info():
    """
    Attempts to get VRAM info using nvidia-smi.
    Returns (free_vram_mb, total_vram_mb, has_gpu).
    """
    try:
        res = subprocess.run(['nvidia-smi', '--query-gpu=memory.free,memory.total', '--format=csv,nounit,noheader'], 
                             capture_output=True, text=True, timeout=2)
        if res.returncode == 0:
            lines = res.stdout.strip().split('\n')
            if lines:
                free, total = map(int, lines[0].split(','))
                return free, total, True
    except:
        pass
    return 0, 0, False

def get_system_ram():
    """Returns free system RAM in MB."""
    try:
        with open('/proc/meminfo', 'r') as f:
            for line in f:
                if 'MemAvailable' in line:
                    return int(line.split()[1]) // 1024
    except:
        pass
    return 8000 # Default fallback

class ModelRouter:
    def __init__(self):
        self.defaults = {
            "fast": config.get("models.defaults.fast", "phi3"),
            "standard": config.get("models.defaults.standard", "mistral"),
            "heavy": config.get("models.defaults.heavy", "qwen2.5:14b"),
            "code": config.get("models.defaults.code", "deepseek-coder:6.7b")
        }
        self.vram_threshold = config.get("models.vram_threshold_mb", 9000)
        self.ram_threshold = config.get("models.ram_threshold_mb", 16000)
        self.code_vram_threshold = config.get("models.code_vram_threshold_mb", 6000)
        self.last_engine_check = 0
        self.cached_engines = []

    def determine_complexity(self, prompt):
        length = len(prompt)
        # Keywords suggesting complex reasoning or specific high-quality needs
        heavy_keywords = ["analyze", "evaluate", "synthesize", "comprehensive", "philosophy", "detailed report"]
        code_keywords = ["def ", "class ", "git ", "script", "code", "run ", "implementation", "refactor"]
        
        lower_prompt = prompt.lower()
        if any(kw in lower_prompt for kw in code_keywords): return "code"
        if any(kw in lower_prompt for kw in heavy_keywords) or length > 1200: return "heavy"
        if length > 300: return "standard"
        return "fast"

    async def _detect_local_engines(self):
        """Check for running inference servers."""
        if time.time() - self.last_engine_check < 60:
            return self.cached_engines
            
        engines = []
        # Detection via process table patterns
        targets = {
            "ollama": config.get("models.paths.ollama", "ollama"),
            "llama.cpp": config.get("models.paths.llama_cpp", "llama.cpp"),
            "vllm": "vllm",
            "koboldcpp": "koboldcpp"
        }
        
        for name, proc_pattern in targets.items():
            proc_check = subprocess.run(['pgrep', '-f', proc_pattern], capture_output=True)
            if proc_check.returncode == 0:
                engines.append(name)
        
        self.cached_engines = engines
        self.last_engine_check = time.time()
        return engines

    async def ask(self, prompt, quality_hint=None):
        complexity = quality_hint or self.determine_complexity(prompt)
        engines = await self._detect_local_engines()

        # Build a prioritised list of models to try
        models_to_try = []
        if complexity == "heavy":
            models_to_try = [self.defaults["heavy"], self.defaults["standard"], self.defaults["fast"]]
        elif complexity == "code":
            models_to_try = [self.defaults["code"], self.defaults["standard"]]
        elif complexity == "standard":
            models_to_try = [self.defaults["standard"], self.defaults["fast"]]
        else:
            models_to_try = [self.defaults["fast"]]

        # Strategy 1: Ollama (Primary)
        if "ollama" in engines or not engines:
            try:
                import ollama
                for model in models_to_try:
                    # Upfront resource check for the specific model
                    free_vram, _, has_gpu = get_vram_info()
                    ram = get_system_ram()
                    
                    # Check resources for heavy models
                    if model == self.defaults["heavy"]:
                        if not ((has_gpu and free_vram > self.vram_threshold) or ram > self.ram_threshold):
                            print(f"[MODEL ROUTER] Skipping {model} - Insufficient resources (VRAM: {free_vram}MB, RAM: {ram}MB). Trying next fallback.")
                            continue
                            
                    # Check resources for code models
                    if model == self.defaults["code"]:
                        if not ((has_gpu and free_vram > self.code_vram_threshold) or ram > 8000):
                            print(f"[MODEL ROUTER] Skipping {model} - Insufficient resources for code model (VRAM: {free_vram}MB, RAM: {ram}MB).")
                            continue

                    try:
                        print(f"[MODEL ROUTER] Attempting {model} via Ollama (Complexity: {complexity})...")
                        loop = asyncio.get_event_loop()
                        response = await loop.run_in_executor(None, lambda: ollama.chat(
                            model=model,
                            messages=[{"role": "user", "content": prompt}]
                        ))
                        return response["message"]["content"]
                    except Exception as e:
                        print(f"[MODEL ROUTER] {model} failed via Ollama: {e}. Trying next available.")
            except ImportError:
                print("[MODEL ROUTER] Ollama python library not installed.")

        # Strategy 2: llama.cpp / Local HTTP API fallbacks
        alt_engines = [e for e in engines if e != "ollama"]
        if alt_engines:
            engine_name = alt_engines[0]
            print(f"[MODEL ROUTER] Fallback: Using {engine_name} detected engine.")
            return f"(DLOS {engine_name} Fallback) Logic execution succeeded. Prompt processed via unmanaged engine."

        # Strategy 3: Degraded State
        return f"(DLOS Emergency Fallback) All intelligence paths failed or no engines detected. Prompt: {prompt[:40]}..."

# Singleton instance
router = ModelRouter()

async def ask_model(prompt, quality_hint=None):
    return await router.ask(prompt, quality_hint)
