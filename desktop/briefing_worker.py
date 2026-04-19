# desktop/briefing_worker.py
import json
import time
from PySide6.QtCore import QThread, Signal
import requests

class AIBriefingWorker(QThread):
    """
    Background worker to handle AI briefing generation without blocking the Main GUI Thread.
    Emits signals for successful completion or error reporting.
    """
    finished = Signal(dict)
    error = Signal(str)

    def __init__(self, user_data, api_config):
        super().__init__()
        self.user_data = user_data
        self.api_config = api_config

    def run(self):
        try:
            # 1. Prepare the payload and prompt
            # We enforce a strict JSON schema in the prompt as per V3 directives.
            prompt = f"""
            As a Proactive AI Student Planner, analyze this data: {json.dumps(self.user_data)}
            
            OUTPUT REQUIREMENT:
            You MUST return a valid JSON object with the following exact keys:
            - "priorities": (List of strings) The top 3 academic focuses for today.
            - "details": (String) A comprehensive summary including wellness correlations and proactive nudges.
            
            Return ONLY the raw JSON.
            """

            # 2. Execute the network request (simulating Ollama/Cloud call)
            # In a real desktop app, we'd hit http://localhost:11434/api/generate or a cloud endpoint.
            # Using a try/except specifically for ConnectionErrors.
            
            target_url = self.api_config.get("url", "http://localhost:11434/api/generate")
            
            try:
                # Simulated request logic
                # response = requests.post(target_url, json={"prompt": prompt, "stream": False}, timeout=15)
                # response.raise_for_status()
                # result_text = response.json().get("response", "{}")
                
                # For demo purposes, we simulate a slight network delay
                time.sleep(2) 
                
                # Mock result that follows the schema
                mock_json = {
                    "priorities": ["Finish Biology Lab Report", "Review Math Matrices", "Read Art History Ch-4"],
                    "details": "Your focus is trending upwards. However, your 6.5h sleep cycle suggests a cognitive dip around 3:00 PM. I suggest shifting your heavy Math review to the morning window."
                }
                
                # 3. Safe Parsing
                # result_data = json.loads(result_text)
                result_data = mock_json
                
                if "priorities" not in result_data or "details" not in result_data:
                    raise ValueError("Incomplete AI response schema.")

                self.finished.emit(result_data)

            except requests.exceptions.ConnectionError:
                self.error.emit("Error: Local AI engine is not responding. Please ensure Ollama is running.")
            except Exception as e:
                self.error.emit(f"AI Generation Failed: {str(e)}")

        except Exception as e:
            self.error.emit(f"Worker System Error: {str(e)}")
