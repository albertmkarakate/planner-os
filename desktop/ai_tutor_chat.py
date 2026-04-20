from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QPushButton, QTextEdit, QLineEdit, QLabel, QMessageBox)
from PySide6.QtCore import Qt, Signal, Slot
from cognitive_engine import ChatWorker

class AITutorChatTab(QWidget):
    """An interactive chat window that reads the current notebook."""
    def __init__(self, notebook_editor):
        super().__init__()
        self.notebook_editor = notebook_editor # Reference to access active notes
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        # 1. Quick Action Prompts
        quick_layout = QHBoxLayout()
        self.btn_explain = QPushButton("🧩 Explain Current Note")
        self.btn_stuck = QPushButton("🆘 I'm Stuck")
        quick_layout.addWidget(self.btn_explain)
        quick_layout.addWidget(self.btn_stuck)
        layout.addLayout(quick_layout)

        # 2. Chat History Area
        self.chat_history = QTextEdit()
        self.chat_history.setReadOnly(True)
        self.chat_history.setStyleSheet("background-color: palette(base); border-radius: 8px; padding: 10px;")
        
        # Welcome message
        welcome_msg = (
            "<b style='color:#3498db;'>🤖 AI Tutor:</b> "
            "I'm monitoring your active notebook. If you hit a wall, ask me to explain, "
            "or type 'Quiz Me' and I'll test your understanding!"
        )
        self.chat_history.setHtml(welcome_msg)
        layout.addWidget(self.chat_history)

        # 3. User Input Area
        input_layout = QHBoxLayout()
        self.user_input = QLineEdit()
        self.user_input.setPlaceholderText("e.g., 'I don't get the second paragraph...'")
        self.user_input.setStyleSheet("padding: 8px; border-radius: 12px;")
        self.user_input.returnPressed.connect(self.send_message)
        
        self.btn_send = QPushButton("Send")
        self.btn_send.setObjectName("PrimaryAction")
        self.btn_send.setFixedWidth(70)
        self.btn_send.clicked.connect(self.send_message)
        
        input_layout.addWidget(self.user_input)
        input_layout.addWidget(self.btn_send)
        layout.addLayout(input_layout)

        # Signal connections
        self.btn_explain.clicked.connect(self.handle_explain_current)
        self.btn_stuck.clicked.connect(self.handle_im_stuck)

    def send_message(self):
        text = self.user_input.text().strip()
        if not text:
            return
        
        self.append_message("Me", text)
        self.user_input.clear()
        self.start_chat_worker(text)

    def handle_explain_current(self):
        prompt = "Please summarize the core concepts of my current notes and point out anything I seem to be missing."
        self.append_message("Me", "Explain this note to me...")
        self.start_chat_worker(prompt)

    def handle_im_stuck(self):
        prompt = "I am stuck on the last concept I wrote down. Please break it down into smaller, easier-to-understand pieces and ask me a question to make sure I get it."
        self.append_message("Me", "I'm stuck here!")
        self.start_chat_worker(prompt)

    def start_chat_worker(self, message):
        # Context Injection: Get current text from notebook canvas
        notebook_context = self.notebook_editor.toPlainText()
        
        self.chat_history.append("<br><b style='color:#3498db;'>🤖 AI Tutor:</b> ")
        
        self.worker = ChatWorker(message, notebook_context)
        self.worker.chunk_received.connect(self.on_chunk_received)
        self.worker.error.connect(self.on_error)
        self.worker.finished.connect(lambda: self.user_input.setEnabled(True))
        
        self.user_input.setEnabled(False)
        self.worker.start()

    @Slot(str)
    def on_chunk_received(self, chunk):
        # Update UI in real-time (Typewriter effect)
        cursor = self.chat_history.textCursor()
        cursor.movePosition(cursor.MoveOperation.End)
        cursor.insertText(chunk)
        self.chat_history.setTextCursor(cursor)
        self.chat_history.ensureCursorVisible()

    def on_error(self, error_msg):
        QMessageBox.critical(self, "Tutor Error", f"Failed to reach AI worker: {error_msg}")
        self.user_input.setEnabled(True)

    def append_message(self, sender, text):
        color = "#e74c3c" if sender == "Me" else "#3498db"
        self.chat_history.append(f"<br><b style='color:{color};'>{sender}:</b> {text}")
        self.chat_history.ensureCursorVisible()
