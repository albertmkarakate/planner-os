# desktop/ollama_manager.py
import json
from PySide6.QtCore import QThread, Signal
import ollama

class OllamaPullWorker(QThread):
    """
    Background worker for pulling models from Ollama library.
    Streams progress updates to the QProgressBar.
    """
    progress = Signal(int)
    status = Signal(str)
    finished = Signal()
    error = Signal(str)

    def __init__(self, model_name):
        super().__init__()
        self.model_name = model_name

    def run(self):
        try:
            self.status.emit(f"Initializing pull for {self.model_name}...")
            
            # Using the streaming pull method from ollama-python
            response = ollama.pull(self.model_name, stream=True)
            
            for chunk in response:
                if 'total' in chunk and 'completed' in chunk:
                    percentage = int((chunk['completed'] / chunk['total']) * 100)
                    self.progress.emit(percentage)
                
                if 'status' in chunk:
                    self.status.emit(chunk['status'])
            
            self.finished.emit()
        except Exception as e:
            self.error.emit(f"Ollama Error: {str(e)}")

class OllamaInterface:
    """Helper to interact with local Ollama instance."""
    @staticmethod
    def list_local_models():
        try:
            models = ollama.list()
            return [m['name'] for m in models.get('models', [])]
        except:
            return []
