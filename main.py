import sys
import os
import qdarktheme
from PySide6.QtWidgets import QApplication, QMainWindow, QTabWidget, QVBoxLayout, QWidget
from PySide6.QtGui import QIcon

# Import Desktop Modules
# Add desktop/ to path if needed for relocatable structure
sys.path.append(os.path.join(os.path.dirname(__file__), 'desktop'))

from notebook_lab import NotebookEditorTab
from knowledge_lab import KnowledgeLabWindow

class ResourcePath:
    """Helper to locate assets in a relocatable way (for AppImage/PyInstaller)."""
    @staticmethod
    def get(relative_path):
        # 1. Check for AppImage base dir
        appdir = os.environ.get('APPDIR')
        if appdir:
            return os.path.join(appdir, 'usr', 'bin', relative_path)
        
        # 2. Check for Nuitka/PyInstaller temp dir
        base_path = getattr(sys, '_MEIPASS', os.path.abspath("."))
        return os.path.join(base_path, relative_path)

class StudentPlannerOS(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Student Planner OS - Unified Academic Workspace")
        self.resize(1200, 800)
        
        # Load Global Style
        style_path = ResourcePath.get("assets/style.qss")
        if os.path.exists(style_path):
            with open(style_path, "r") as f:
                self.setStyleSheet(f.read())
        
        # Central Tab System
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)
        
        # Integrate Modules
        self.tabs.addTab(NotebookEditorTab(), "📓 Notebook Lab")
        self.tabs.addTab(KnowledgeLabWindow(), "🧪 Knowledge Lab")
        
        self.setup_statusbar()

    def setup_statusbar(self):
        self.statusBar().showMessage("System Ready: AI Cognitive Engines Online")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # Set App Metadata
    app.setApplicationName("Student Planner OS")
    app.setOrganizationName("DevOps Release Engineering")
    app.setApplicationVersion("1.0.0")
    
    icon_path = ResourcePath.get("assets/icon.png")
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))
    
    window = StudentPlannerOS()
    window.show()
    sys.exit(app.exec())
