# desktop/knowledge_lab.py
import sys
import os
import json
from PySide6.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                               QPushButton, QLabel, QComboBox, QTabWidget, 
                               QTextEdit, QListWidget, QProgressBar, QFrame, 
                               QGroupBox, QFormLayout, QFileDialog, QRadioButton,
                               QButtonGroup, QLineEdit, QSplitter, QMessageBox)
from PySide6.QtCore import Qt, QThread, Signal

# Import backends
from vault_builder import MarkdownVaultBuilder
from ollama_manager import OllamaPullWorker, OllamaInterface
from podcast_engine import PodcastEngine

class KnowledgeLabWindow(QWidget):
    """
    Main Knowledge Lab View for Student Planner OS.
    Integrates Obsidian export, Podcast generation, and Model management.
    """
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Student Planner - AI Knowledge Lab")
        self.resize(1000, 700)
        
        # Mastery Style (OS V3)
        self.setStyleSheet("""
            QWidget { background-color: #1a1a24; color: #ffffff; font-family: 'Inter', sans-serif; }
            QGroupBox { font-weight: bold; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; margin-top: 10px; padding: 15px; }
            QPushButton#PrimaryAction { background-color: #9d81ff; color: white; border-radius: 6px; padding: 12px; font-weight: 800; text-transform: uppercase; }
            QProgressBar { border: 1px solid rgba(255,255,255,0.1); border-radius: 5px; text-align: center; height: 10px; }
            QProgressBar::chunk { background-color: #9d81ff; }
            QTabWidget::pane { border: 1px solid rgba(255,255,255,0.05); }
        """)

        layout = QVBoxLayout(self)
        self.tabs = QTabWidget()
        
        # Tabs
        self.tabs.addTab(self.build_export_tab(), "📂 Obsidian Export")
        self.tabs.addTab(self.build_podcast_tab(), "🎧 Audio Podcast")
        self.tabs.addTab(self.build_templates_tab(), "🎬 Creator Templates")
        self.tabs.addTab(self.build_llm_tab(), "⚙️ AI Downloader")
        
        layout.addWidget(self.tabs)

    # --- TAB 1: OBSIDIAN EXPORT ---
    def build_export_tab(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        
        header = QLabel("<h2>📦 Knowledge Vault Exporter</h2>")
        layout.addWidget(header)

        # Mode Selection
        mode_box = QGroupBox("Export Configuration")
        mode_layout = QVBoxLayout(mode_box)
        self.radio_basic = QRadioButton("Basic Mode (1-Click Export)")
        self.radio_basic.setChecked(True)
        self.radio_expert = QRadioButton("Expert Mode (Custom YAML & Wiki-Links)")
        mode_layout.addWidget(self.radio_basic)
        mode_layout.addWidget(self.radio_expert)
        
        self.expert_settings = QFrame()
        expert_form = QFormLayout(self.expert_settings)
        self.tag_link_type = QComboBox()
        self.tag_link_type.addItems(["#tag", "[[tag]]", "YAML property"])
        expert_form.addRow("Link Format:", self.tag_link_type)
        self.expert_settings.setVisible(False)
        mode_layout.addWidget(self.expert_settings)
        
        self.radio_expert.toggled.connect(self.expert_settings.setVisible)
        layout.addWidget(mode_box)

        self.btn_export = QPushButton("Export Notes to Markdown")
        self.btn_export.setObjectName("PrimaryAction")
        self.btn_export.clicked.connect(self.handle_vault_export)
        layout.addWidget(self.btn_export)
        layout.addStretch()
        return page

    def handle_vault_export(self):
        dest = QFileDialog.getExistingDirectory(self, "Select Vault Directory")
        if not dest: return
        
        # Mock data for demonstration
        mock_notes = [
            {"title": "Biology Chapter 4", "content": "Biology covers the study of life. In chapter 4 we discuss cell division.", "tags": ["study", "biology"], "date": "2024-04-19", "class_name": "Biology 101"},
            {"title": "AWS S3 Basics", "content": "Simple Storage Service is a key AWS exam objective.", "tags": ["cloud", "aws"], "date": "2024-04-18", "class_name": "Cloud Computing"}
        ]
        
        builder = MarkdownVaultBuilder(dest, classes=["Biology 101", "Cloud Computing"])
        builder.batch_export(mock_notes)
        QMessageBox.information(self, "Success", f"Exported {len(mock_notes)} notes to Obsidian Vault.")

    # --- TAB 2: PODCAST GENERATOR ---
    def build_podcast_tab(self):
        page = QWidget()
        splitter = QSplitter(Qt.Horizontal)
        
        # Source Selection
        lp = QFrame(); ll = QVBoxLayout(lp)
        ll.addWidget(QLabel("<b>1. Selection Matrix</b>"))
        self.source_list = QListWidget()
        self.source_list.addItems(["Biology Chapter 4", "History Lecture 9", "Algebra Recap"])
        ll.addWidget(self.source_list)
        
        # Config
        rp = QFrame(); rl = QVBoxLayout(rp)
        rl.addWidget(QLabel("<b>2. AI Audio Blueprint</b>"))
        form = QFormLayout()
        self.h1_voice = QComboBox(); self.h1_voice.addItems(["Alex (Neutral)", "Ken (Resonant)"])
        self.h2_voice = QComboBox(); self.h2_voice.addItems(["Sarah (Bright)", "Jamie (Warm)"])
        form.addRow("Host 1:", self.h1_voice)
        form.addRow("Host 2:", self.h2_voice)
        rl.addLayout(form)
        
        self.btn_pod = QPushButton("Generate Podcast")
        self.btn_pod.setObjectName("PrimaryAction")
        self.btn_pod.clicked.connect(self.handle_podcast_gen)
        rl.addWidget(self.btn_pod)
        
        self.pod_progress = QProgressBar()
        rl.addWidget(self.pod_progress)
        rl.addStretch()
        
        splitter.addWidget(lp); splitter.addWidget(rp)
        layout = QVBoxLayout(page); layout.addWidget(splitter)
        return page

    def handle_podcast_gen(self):
        self.btn_pod.setEnabled(False)
        self.pod_progress.setValue(25) # Mock steps
        # PodcastEngine would be triggered here in a real Worker
        QMessageBox.warning(self, "Architecture Note", "Multi-speaker TTS requires PyTorch and Bark models (approx 4GB). Downloading engine weights...")
        self.pod_progress.setValue(100)
        self.btn_pod.setEnabled(True)

    # --- TAB 3: CREATOR TEMPLATES ---
    def build_templates_tab(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        
        self.style_presets = {
            "Minimalist Productivity": "System: Use calm, flowing language. Focus on 'peace of mind' and 'frictionless systems'. No bullets.",
            "High-Energy Tech Review": "System: Fast-paced, high vocabulary. Use ALL CAPS for emphasis. Bullet points everywhere.",
            "Lore Video Essayist": "System: Deep narrative style. Use metaphors. End with a philosophical question about the nature of study."
        }
        
        form = QFormLayout()
        self.style_selector = QComboBox()
        self.style_selector.addItems(list(self.style_presets.keys()))
        form.addRow("Influencer Persona:", self.style_selector)
        layout.addLayout(form)
        
        self.template_prev = QTextEdit()
        self.template_prev.setReadOnly(True)
        self.style_selector.currentTextChanged.connect(lambda t: self.template_prev.setText(self.style_presets[t]))
        self.template_prev.setText(self.style_presets["Minimalist Productivity"])
        layout.addWidget(QLabel("<b>System Blueprint Override:</b>"))
        layout.addWidget(self.template_prev)
        return page

    # --- TAB 4: LLM MANAGER ---
    def build_llm_tab(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        
        group = QGroupBox("Ollama Model Orchestration")
        l = QVBoxLayout(group)
        l.addWidget(QLabel("Download local weights for total privacy."))
        
        h = QHBoxLayout()
        self.model_in = QLineEdit()
        self.model_in.setPlaceholderText("llama3, mistral, phi3...")
        self.btn_pull = QPushButton("Pull Model")
        self.btn_pull.clicked.connect(self.start_model_pull)
        h.addWidget(self.model_in); h.addWidget(self.btn_pull)
        l.addLayout(h)
        
        self.dl_progress = QProgressBar()
        l.addWidget(self.dl_progress)
        
        self.model_list = QListWidget()
        self.refresh_models()
        l.addWidget(QLabel("Available Offline Modalities:"))
        l.addWidget(self.model_list)
        layout.addWidget(group)
        return page

    def refresh_models(self):
        self.model_list.clear()
        names = OllamaInterface.list_local_models()
        self.model_list.addItems(names if names else ["(No models found or Ollama offline)"])

    def start_model_pull(self):
        name = self.model_in.text().strip()
        if not name: return
        
        self.btn_pull.setEnabled(False)
        self.worker = OllamaPullWorker(name)
        self.worker.progress.connect(self.dl_progress.setValue)
        self.worker.finished.connect(lambda: [self.btn_pull.setEnabled(True), self.refresh_models()])
        self.worker.error.connect(lambda e: QMessageBox.critical(self, "Ollama Error", e))
        self.worker.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = KnowledgeLabWindow()
    window.show()
    sys.exit(app.exec())
