import sys
import os
from PySide6.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                               QPushButton, QLabel, QSplitter, QTextEdit, 
                               QListWidget, QFrame, QTabWidget, QLCDNumber, 
                               QComboBox, QGraphicsDropShadowEffect, QMessageBox)
from PySide6.QtCore import Qt, QTimer, QTime
from PySide6.QtGui import QColor, QIcon

from cognitive_engine import CognitiveWorker, StudyDatabase
from ai_tutor_chat import AITutorChatTab

class NotebookEditorTab(QWidget):
    def __init__(self):
        super().__init__()
        self.db = StudyDatabase()
        self.init_ui()
        self.setup_pomodoro()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(15)

        # ==========================================
        # TOP BAR: Method 1 - Pomodoro
        # ==========================================
        top_bar = QHBoxLayout()
        top_bar.addWidget(QLabel("<h2>📚 Active Knowledge Base</h2>"))
        top_bar.addStretch()
        
        self.timer_display = QLCDNumber()
        self.timer_display.display("25:00")
        self.timer_display.setSegmentStyle(QLCDNumber.SegmentStyle.Flat)
        self.timer_display.setFixedSize(80, 35)
        
        top_bar.addWidget(QLabel("🍅 Pomodoro:"))
        top_bar.addWidget(self.timer_display)
        
        self.btn_pomodoro = QPushButton("Start Focus")
        self.btn_pomodoro.clicked.connect(self.toggle_timer)
        top_bar.addWidget(self.btn_pomodoro)
        layout.addLayout(top_bar)

        main_splitter = QSplitter(Qt.Orientation.Horizontal)

        # LEFT: Subjects
        left_pane = QFrame(); left_pane.setObjectName("ModernCard")
        left_layout = QVBoxLayout(left_pane)
        left_layout.addWidget(QLabel("<b>Your Notebooks</b>"))
        self.notebook_list = QListWidget()
        self.notebook_list.addItems(["Biology", "History", "Physics"])
        left_layout.addWidget(self.notebook_list)
        self.btn_interleave = QPushButton("🔀 Interleave Review")
        self.btn_interleave.clicked.connect(self.run_interleaving)
        left_layout.addWidget(self.btn_interleave)
        main_splitter.addWidget(left_pane)

        # MIDDLE: Editor
        mid_pane = QFrame(); mid_pane.setObjectName("ModernCard")
        mid_layout = QVBoxLayout(mid_pane)
        mid_layout.addWidget(QLabel("<b>Active Editor</b>"))
        self.text_editor = QTextEdit()
        mid_layout.addWidget(self.text_editor)
        self.btn_save = QPushButton("💾 Save & Synthesize")
        self.btn_save.clicked.connect(self.save_and_elaborate)
        mid_layout.addWidget(self.btn_save)
        main_splitter.addWidget(mid_pane)

        # RIGHT: Tools
        right_pane = QFrame(); right_pane.setObjectName("ModernCard")
        right_layout = QVBoxLayout(right_pane)
        self.tools_tabs = QTabWidget()
        
        # Feynman
        self.feynman_tab = QWidget()
        f_lay = QVBoxLayout(self.feynman_tab)
        self.feynman_input = QTextEdit()
        f_lay.addWidget(QLabel("Teach it simple:"))
        f_lay.addWidget(self.feynman_input)
        self.btn_feynman = QPushButton("🤖 AI Grade My Explanation")
        self.btn_feynman.clicked.connect(self.run_feynman)
        f_lay.addWidget(self.btn_feynman)
        self.tools_tabs.addTab(self.feynman_tab, "Feynman")

        # Deep Dive
        self.deep_tab = QWidget()
        d_lay = QVBoxLayout(self.deep_tab)
        self.question_list = QListWidget()
        d_lay.addWidget(QLabel("AI Interrogation:"))
        d_lay.addWidget(self.question_list)
        self.tools_tabs.addTab(self.deep_tab, "Deep Dive")

        # Tutor Chat
        self.tutor_chat = AITutorChatTab(self.text_editor)
        self.tools_tabs.addTab(self.tutor_chat, "💬 Tutor Chat")

        right_layout.addWidget(self.tools_tabs)
        main_splitter.addWidget(right_pane)

        main_splitter.setSizes([200, 500, 300])
        layout.addWidget(main_splitter)

    # --- POMODORO LOGIC ---
    def setup_pomodoro(self):
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_timer)
        self.time_left = QTime(0, 25, 0)
        self.is_running = False

    def toggle_timer(self):
        if not self.is_running:
            self.timer.start(1000)
            self.btn_pomodoro.setText("Pause")
        else:
            self.timer.stop()
            self.btn_pomodoro.setText("Resume")
        self.is_running = not self.is_running

    def update_timer(self):
        self.time_left = self.time_left.addSecs(-1)
        self.timer_display.display(self.time_left.toString("mm:ss"))
        if self.time_left.toString("mm:ss") == "00:00":
            self.timer.stop()
            QMessageBox.information(self, "Pomodoro", "Time for a 5-minute break!")
            self.time_left = QTime(0, 25, 0)

    # --- COGNITIVE ACTIONS ---
    def run_feynman(self):
        explanation = self.feynman_input.toPlainText()
        self.worker = CognitiveWorker("feynman", explanation)
        self.worker.finished.connect(lambda res: QMessageBox.about(self, "Feynman Analysis", res))
        self.worker.start()

    def save_and_elaborate(self):
        content = self.text_editor.toPlainText()
        # 1. Trigger question generation
        self.q_worker = CognitiveWorker("questions", content)
        self.q_worker.finished.connect(self.update_questions)
        self.q_worker.start()
        # 2. Trigger flashcard extraction
        self.f_worker = CognitiveWorker("flashcards", content)
        self.f_worker.start()

    def update_questions(self, questions):
        self.question_list.clear()
        self.question_list.addItems(questions)

    def run_interleaving(self):
        queue = self.db.get_interleaved_queue()
        if not queue:
            QMessageBox.warning(self, "Interleaving", "No flashcards due today across subjects.")
            return
        msg = f"Queue Created: {len(queue)} cards.\nOrder: " + ", ".join([c['subject'] for c in queue[:5]]) + "..."
        QMessageBox.information(self, "Shuffle Complete", msg)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = NotebookEditorTab()
    window.resize(1100, 700)
    window.show()
    sys.exit(app.exec())
