import tempfile
import os
import json
from datetime import datetime
from icalendar import Calendar as ICalCalendar, Event as ICalEvent
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QComboBox, 
                               QStackedWidget, QLabel, QPushButton, QCalendarWidget, 
                               QGridLayout, QGroupBox, QListWidget, QListWidgetItem,
                               QFrame, QSizePolicy)
from PySide6.QtGui import QDesktopServices, QColor, QPainter, QBrush
from PySide6.QtCore import QUrl, Qt, QRect

class EventBadgeCalendar(QCalendarWidget):
    """
    Subclassed QCalendarWidget to paint custom dots on days with events.
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.event_days = set() # Days with events (e.g., [15, 19, 20])

    def set_event_days(self, days):
        self.event_days = set(days)
        self.update()

    def paintCell(self, painter, rect, date):
        super().paintCell(painter, rect, date)
        if date.month() == self.monthShown() and date.day() in self.event_days:
            painter.save()
            painter.setRenderHint(QPainter.RenderHint.Antialiasing)
            painter.setBrush(QBrush(QColor("#9d81ff")))
            painter.setPen(Qt.PenStyle.NoPen)
            # Draw a small circle at the bottom center of the cell
            dot_size = 4
            painter.drawEllipse(rect.center().x() - dot_size//2, rect.bottom() - 6, dot_size, dot_size)
            painter.restore()

class AdvancedCalendarView(QWidget):
    """
    Advanced Calendar Module with Yearly, Monthly, and Weekly views.
    Includes hardware/OS integration for .ics export.
    """
    def __init__(self):
        super().__init__()
        self.setObjectName("CalendarView")
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(30, 30, 30, 30)
        self.layout.setSpacing(20)
        
        # --- HEADER ROUTER ---
        self.header_layout = QHBoxLayout()
        
        # Selector mimicking the React V3 UI
        self.view_selector = QComboBox()
        self.view_selector.addItems(["Yearly Overview", "Monthly Plan", "Weekly Schedule"])
        self.view_selector.setFixedWidth(200)
        
        header_label = QLabel("<b>Temporal Map</b>")
        header_label.setStyleSheet("font-size: 24px; color: #ffffff;")
        
        self.header_layout.addWidget(header_label)
        self.header_layout.addSpacing(20)
        self.header_layout.addWidget(QLabel("View:"))
        self.header_layout.addWidget(self.view_selector)
        self.header_layout.addStretch()
        
        self.btn_export = QPushButton("🔔 Push Event to OS Calendar")
        self.btn_export.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_export.setStyleSheet("""
            QPushButton {
                background-color: #9d81ff;
                color: white;
                font-weight: bold;
                border-radius: 6px;
                padding: 10px 20px;
            }
            QPushButton:hover {
                background-color: #8a6be6;
            }
        """)
        self.btn_export.clicked.connect(self.export_to_system_calendar)
        self.header_layout.addWidget(self.btn_export)
        
        self.layout.addLayout(self.header_layout)
        
        # --- STACKED WIDGET ---
        self.stack = QStackedWidget()
        self.layout.addWidget(self.stack)
        
        # Add the distinct pages
        self.stack.addWidget(self.build_yearly_view())
        self.stack.addWidget(self.build_monthly_view())
        self.stack.addWidget(self.build_weekly_view())
        
        # Connect router
        self.view_selector.currentIndexChanged.connect(self.stack.setCurrentIndex)
        
        # Set default to monthly
        self.view_selector.setCurrentIndex(1)

    def build_yearly_view(self):
        page = QWidget()
        layout = QHBoxLayout(page)
        layout.setSpacing(20)
        
        # Left: 12-Month Grid (3x4)
        grid_container = QFrame()
        grid_container.setStyleSheet("background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);")
        grid = QGridLayout(grid_container)
        grid.setSpacing(10)
        
        for row in range(3):
            for col in range(4):
                month_idx = row * 4 + col + 1
                mini_cal = QCalendarWidget()
                mini_cal.setNavigationBarVisible(False)
                mini_cal.setVerticalHeaderFormat(QCalendarWidget.VerticalHeaderFormat.NoVerticalHeader)
                mini_cal.setStyleSheet("font-size: 8px; background: transparent; border: none;")
                mini_cal.setFixedSize(140, 120)
                grid.addWidget(mini_cal, row, col)
        
        # Right: Yearly Goals
        goals = QGroupBox("Yearly Vision & Key Dates")
        goals.setStyleSheet("color: white; font-weight: bold;")
        goals_layout = QVBoxLayout(goals)
        goals_layout.setContentsMargins(15, 20, 15, 20)
        
        vision_text = QTextEdit() if False else QLabel() # simplified for demo
        vision_text.setText("<b>1. Academic Performance:</b> Maintain 4.0 GPA\n"
                             "<b>2. Certification:</b> AWS Cloud Practitioner\n"
                             "<b>3. Health:</b> 8 hours sleep average\n\n"
                             "<b>Key Dates:</b>\n"
                             "- Final Exams (Apr 20-30)\n"
                             "- Summer Internship Starts (June 5)")
        vision_text.setWordWrap(True)
        vision_text.setStyleSheet("font-weight: normal; color: rgba(255, 255, 255, 0.6);")
        
        goals_layout.addWidget(vision_text)
        goals_layout.addStretch()
        
        layout.addWidget(grid_container, stretch=3)
        layout.addWidget(goals, stretch=1)
        return page

    def build_monthly_view(self):
        page = QWidget()
        layout = QHBoxLayout(page)
        layout.setSpacing(20)
        
        # Left: Custom Calendar
        self.main_cal = EventBadgeCalendar()
        self.main_cal.set_event_days([15, 19, 20, 25])
        self.main_cal.setStyleSheet("""
            QCalendarWidget QWidget#qt_calendar_navigationbar { background-color: rgba(255,255,255,0.05); }
            QCalendarWidget QAbstractItemView:enabled { color: white; selection-background-color: #9d81ff; selection-color: white; }
        """)
        
        # Right: Monthly Sidebar
        sidebar = QGroupBox("Monthly Focus & Trackers")
        sidebar.setStyleSheet("color: white; font-weight: bold;")
        side_layout = QVBoxLayout(sidebar)
        
        upcoming_list = QListWidget()
        upcoming_list.setStyleSheet("background: transparent; border: none; font-weight: normal;")
        events = ["Apr 20: Bio Exam Unit 2", "Apr 24: History Essay Due", "Apr 25: Lab Reflection"]
        for e in events:
            item = QListWidgetItem(e)
            item.setForeground(QColor("rgba(255, 255, 255, 0.8)"))
            upcoming_list.addItem(item)
            
        side_layout.addWidget(QLabel("Upcoming Milestones:"))
        side_layout.addWidget(upcoming_list)
        side_layout.addStretch()
        
        layout.addWidget(self.main_cal, stretch=3)
        layout.addWidget(sidebar, stretch=1)
        return page

    def build_weekly_view(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        
        # Top: 7-Day Agile columns
        days_container = QWidget()
        days_layout = QHBoxLayout(days_container)
        days_layout.setContentsMargins(0, 0, 0, 0)
        
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for day in days:
            col = QGroupBox(day)
            col.setStyleSheet("font-weight: bold; color: rgba(255,255,255,0.4);")
            col_layout = QVBoxLayout(col)
            tasks = QListWidget()
            tasks.setStyleSheet("background: transparent; border: none; font-size: 10px;")
            tasks.addItem("Study session (2h)")
            col_layout.addWidget(tasks)
            days_layout.addWidget(col)
            
        # Bottom: Meal Plan & Priorities
        bottom_layout = QHBoxLayout()
        meal_plan = QGroupBox("Weekly Meal Plan (Nutrition OS)")
        meal_layout = QVBoxLayout(meal_plan)
        meal_layout.addWidget(QLabel("Mon: Salmon & Veggies\nTue: Meal Prep Pasta\nWed: Quinoa Salad"))
        
        priorities = QGroupBox("Top 3 Priorities")
        prio_layout = QVBoxLayout(priorities)
        prio_layout.addWidget(QLabel("1. Exam Ready\n2. Rent Paid\n3. Sleep Sync"))
        
        bottom_layout.addWidget(meal_plan, stretch=1)
        bottom_layout.addWidget(priorities, stretch=1)
        
        layout.addWidget(days_container, stretch=2)
        layout.addLayout(bottom_layout, stretch=1)
        return page

    def export_to_system_calendar(self):
        """Generates an .ics file and opens it with the default OS calendar app."""
        try:
            cal = ICalCalendar()
            cal.add('prodid', '-//Student Planner OS//mxm.dk//')
            cal.add('version', '2.0')

            event = ICalEvent()
            event.add('summary', 'Biology Exam: Unit 2')
            # Using current month for example
            now = datetime.now()
            event.add('dtstart', datetime(now.year, now.month, 20, 10, 0, 0))
            event.add('dtend', datetime(now.year, now.month, 20, 12, 0, 0))
            event.add('description', 'AI Generated Study Goal via Proactive Student Planner OS (V3 Architecture).')
            
            cal.add_component(event)

            # Save to temp directory and open
            temp_dir = tempfile.gettempdir()
            filename = f'planner_event_{int(datetime.now().timestamp())}.ics'
            f_path = os.path.join(temp_dir, filename)
            
            with open(f_path, 'wb') as f:
                f.write(cal.to_ical())
            
            print(f"✅ Event exported to {f_path}")
                
            # Trigger OS Handlers
            QDesktopServices.openUrl(QUrl.fromLocalFile(f_path))
        except Exception as e:
            print(f"❌ Export failed: {str(e)}")
