import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student") # student, admin
    preferences = Column(Text, default="{}") # JSON string of user preferences
    created_at = Column(DateTime, default=datetime.utcnow)

    courses = relationship("Course", back_populates="owner", cascade="all, delete-orphan")
    quizzes = relationship("QuizRecord", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def get_preferences(self):
        try:
            return json.loads(self.preferences)
        except Exception:
            return {}

    def set_preferences(self, pref_dict):
        self.preferences = json.dumps(pref_dict)


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(100), primary_key=True, index=True) # e.g. "cs229-ml"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    subject = Column(String(100), default="Computer Science")
    file_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="courses")
    materials = relationship("Material", back_populates="course", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="course", cascade="all, delete-orphan")
    video_lessons = relationship("VideoLesson", back_populates="course", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(String(100), primary_key=True, index=True)
    course_id = Column(String(100), ForeignKey("courses.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, pptx, docx, txt, video, image
    file_path = Column(String(500), default="")
    status = Column(String(50), default="processed") # pending, processing, processed, failed
    chunk_count = Column(Integer, default=0)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="materials")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String(100), default="")
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    status = Column(String(50), default="pending") # pending, processing, completed, failed
    progress_pct = Column(Integer, default=0)
    stage = Column(String(100), default="Queued")
    message = Column(Text, default="")
    error_details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class QuizRecord(Base):
    __tablename__ = "quiz_records"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String(100), default="cs229-ml")
    topic = Column(String(255), nullable=False)
    question_type = Column(String(50), default="mcq") # mcq, short_answer, numerical
    difficulty = Column(String(50), default="intermediate")
    score_pct = Column(Float, default=0.0)
    total_questions = Column(Integer, default=3)
    correct_count = Column(Integer, default=0)
    answers_json = Column(Text, default="[]")
    bkt_updates_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quizzes")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String(100), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), default="Exam Revision Plan")
    exam_date = Column(String(50), default="")
    days_until_exam = Column(Integer, default=7)
    daily_sessions_json = Column(Text, default="[]")
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="study_plans")


class VideoLesson(Base):
    __tablename__ = "video_lessons"

    id = Column(String(100), primary_key=True, index=True)
    course_id = Column(String(100), ForeignKey("courses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    style = Column(String(50), default="animated_concept") # animated_concept, narrated_slides, animated_teacher
    duration_seconds = Column(Integer, default=180)
    video_url = Column(String(500), default="")
    script = Column(Text, default="")
    chapters_json = Column(Text, default="[]")
    captions_json = Column(Text, default="[]")
    related_citations_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="video_lessons")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="learning") # learning, quiz, system, revision
    read = Column(Boolean, default=False)
    link = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
