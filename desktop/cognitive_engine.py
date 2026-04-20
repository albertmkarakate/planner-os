import sqlite3
import json
import random
from PySide6.QtCore import QObject, Signal, QThread

class CognitiveWorker(QThread):
    finished = Signal(object)
    error = Signal(str)

    def __init__(self, task_type, content, extra_params=None):
        super().__init__()
        self.task_type = task_type
        self.content = content
        self.extra_params = extra_params or {}

    def run(self):
        # In a real app, this would call Ollama or Gemini API
        # For the desktop logic, we define the prompts as per Master Directive
        try:
            if self.task_type == "feynman":
                prompt = (
                    "Act as a strict but encouraging professor. The user is explaining a concept to a 5-year-old. "
                    "If they use jargon, penalize them. Highlight areas where their logic breaks down. "
                    f"EXPLANATION: {self.content}"
                )
                # Simulated response
                result = f"Professor Analysis: {self.content[:100]}... [LLM Evaluation active]"
                self.finished.emit(result)

            elif self.task_type == "questions":
                prompt = (
                    "Extract the core thesis of the following note and generate 3 challenging 'Why' or 'How' questions "
                    "to encourage elaborative interrogation. Return as a plain list.\n"
                    f"NOTE: {self.content}"
                )
                result = ["Why does this happen?", "How is it connected?", "What is the primary cause?"]
                self.finished.emit(result)

            elif self.task_type == "flashcards":
                prompt = (
                    "Parse this Markdown note. Identify bolded terms or bullet points and convert them into a "
                    "JSON flashcard format (array of {front, back}).\n"
                    f"NOTE: {self.content}"
                )
                result = [{"front": "Bold Term", "back": "Definition found in text"}]
                self.finished.emit(result)

        except Exception as e:
            self.error.emit(str(e))

class StudyDatabase:
    def __init__(self, db_path="planner.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS flashcards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT,
                    front TEXT,
                    back TEXT,
                    due_date DATE,
                    box INTEGER DEFAULT 0
                )
            """)

    def get_interleaved_queue(self):
        """
        Logic: Query all flashcards due today, shuffle subjects.
        Alternates subjects: Bio, Math, History, etc.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT subject, front, back FROM flashcards ORDER BY due_date ASC")
            all_cards = cursor.fetchall()
            
            # Group by subject
            by_subject = {}
            for s, f, b in all_cards:
                if s not in by_subject: by_subject[s] = []
                by_subject[s].append({"subject": s, "front": f, "back": b})
            
            # Interleaving algorithm
            queue = []
            subjects = list(by_subject.keys())
            while any(by_subject.values()):
                random.shuffle(subjects)
                for s in subjects:
                    if by_subject[s]:
                        queue.append(by_subject[s].pop(0))
            return queue

class ChatWorker(QThread):
    chunk_received = Signal(str)
    finished = Signal()
    error = Signal(str)

    def __init__(self, user_message, notebook_context):
        super().__init__()
        self.user_message = user_message
        self.notebook_context = notebook_context

    def run(self):
        try:
            # System Prompt Formulation as per Master Directive
            system_prompt = (
                "You are an expert, encouraging Socratic tutor. "
                f"Here are the student's current notes: {self.notebook_context}. "
                f"The student says: {self.user_message}. "
                "If they ask for an explanation, use analogies. DO NOT just give them the answers; "
                "ask guiding questions to test their understanding."
            )
            
            # Simulating streaming response
            import time
            response_text = f"As your Socratic tutor, I see you've been working on: '{self.notebook_context[:30]}...'. "
            response_text += "\nTo help you understand this deeper, let's think about it like this..."
            response_text += "\nHave you considered how these concepts interlink with your previous lessons?"
            
            # Emit chunks to simulate typewriter effect
            for chunk in response_text.split(" "):
                self.chunk_received.emit(chunk + " ")
                time.sleep(0.05) # simulate network/generation latency
            
            self.finished.emit()
        except Exception as e:
            self.error.emit(str(e))
