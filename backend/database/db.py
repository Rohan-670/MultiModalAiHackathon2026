import json
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import DATA_DIR
from backend.database.models import (
    Base, User, Course, Material, ProcessingJob,
    QuizRecord, StudyPlan, VideoLesson, Notification
)

DB_PATH = DATA_DIR / "learnsphere.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables and seeds default user and initial course if not present."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if default student exists
        default_user = db.query(User).filter(User.email == "student@learnsphere.ai").first()
        if not default_user:
            from backend.auth.security import hash_password
            default_user = User(
                email="student@learnsphere.ai",
                password_hash=hash_password("learnsphere123"),
                full_name="Alex Chen",
                role="student",
                preferences=json.dumps({
                    "teaching_style": "detailed",
                    "language": "English",
                    "theme": "light",
                    "voice_speed": 1.0,
                    "auto_scaffold": True
                })
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print(f"[DB] Seeded default student: student@learnsphere.ai (ID: {default_user.id})")

        # Check default course
        default_course = db.query(Course).filter(Course.id == "cs229-ml").first()
        if not default_course:
            default_course = Course(
                id="cs229-ml",
                user_id=default_user.id,
                title="CS229: Machine Learning & Optimization Fundamentals",
                description="Core curriculum covering continuous optimization, loss surfaces, gradient descent dynamics, backpropagation, and momentum optimizers.",
                subject="Computer Science & AI",
                file_count=3
            )
            db.add(default_course)
            db.commit()

            # Seed default course materials
            m1 = Material(
                id="mat_cs229_lec1",
                course_id="cs229-ml",
                filename="CS229 Lecture 1 - Optimization Fundamentals.mp4",
                file_type="video",
                file_path="data/CS229_Lecture_1.mp4",
                status="processed",
                chunk_count=5,
                metadata_json=json.dumps({"duration": 360, "timestamps": ["00:45", "01:30", "02:45", "04:15", "05:50"]})
            )
            m2 = Material(
                id="mat_dl_textbook",
                course_id="cs229-ml",
                filename="Deep Learning Textbook (Goodfellow).pdf",
                file_type="pdf",
                file_path="data/Deep_Learning_Goodfellow.pdf",
                status="processed",
                chunk_count=3,
                metadata_json=json.dumps({"pages": [14, 28, 45], "topics": ["Numerical Computation", "Backpropagation", "Mini-Batch SGD"]})
            )
            m3 = Material(
                id="mat_week3_slides",
                course_id="cs229-ml",
                filename="Week 3 Slides - Neural Optimization.pptx",
                file_type="slides",
                file_path="data/Week_3_Slides.pptx",
                status="processed",
                chunk_count=2,
                metadata_json=json.dumps({"slides": [2, 5], "topics": ["Loss Landscapes", "Adam Optimizer"]})
            )
            db.add_all([m1, m2, m3])

            # Seed default video lesson (Agent 7 output)
            v1 = VideoLesson(
                id="vid_lesson_01",
                course_id="cs229-ml",
                user_id=default_user.id,
                title="Visualizing Gradient Descent & Learning Rate Ravines",
                topic="Gradient Descent Dynamics",
                style="animated_concept",
                duration_seconds=195,
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                script="In this animated lesson, we inspect the loss surface J(theta). Stepping opposite to the gradient vector descends the landscape, while excessively high alpha causes explosive divergence.",
                chapters_json=json.dumps([
                    {"title": "Introduction to Empirical Risk", "timestamp": "00:00", "seconds": 0},
                    {"title": "The Negative Gradient Vector Rule", "timestamp": "00:45", "seconds": 45},
                    {"title": "Learning Rate Overshooting", "timestamp": "01:30", "seconds": 90},
                    {"title": "Momentum Acceleration in Ravines", "timestamp": "02:15", "seconds": 135}
                ]),
                captions_json=json.dumps([
                    {"start": 0, "end": 8, "text": "Welcome to LearnSphere AI. Today we visualize continuous gradient optimization."},
                    {"start": 8, "end": 20, "text": "The gradient vector points in the greatest rate of increase of loss J(theta)."},
                    {"start": 20, "end": 35, "text": "Consequently, we step downhill: theta equals theta minus alpha times nabla J."}
                ]),
                related_citations_json=json.dumps(["[CS229 Lecture 1 @ 01:30]", "[Deep Learning Textbook p. 14]"])
            )
            db.add(v1)

            # Seed sample notifications
            n1 = Notification(
                id="notif_1",
                user_id=default_user.id,
                title="Welcome to LearnSphere AI",
                message="Your course 'CS229: Machine Learning & Optimization' is ready with multimodal citations and video player sync.",
                category="system",
                read=False,
                link="/courses/cs229-ml"
            )
            n2 = Notification(
                id="notif_2",
                user_id=default_user.id,
                title="Spaced Repetition Due",
                message="Your retrievability for 'Learning Rate Tuning' has dropped below 50%. Review recommended flashcards.",
                category="revision",
                read=False,
                link="/revision"
            )
            db.add_all([n1, n2])
            db.commit()
            print("[DB] Seeded initial CS229 course materials, lesson, and notifications.")

    except Exception as e:
        print(f"[DB Error] Initialization warning: {e}")
        db.rollback()
    finally:
        db.close()
