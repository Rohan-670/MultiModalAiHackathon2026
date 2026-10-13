import os
import shutil
import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.config import DATA_DIR, gemini_client
from backend.database.db import get_db, init_db
from backend.database.models import (
    User, Course, Material, ProcessingJob,
    QuizRecord, StudyPlan, VideoLesson, Notification
)
from backend.auth.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from backend.vectorstore.db_client import HybridVectorStore
from backend.ingestion.smart_ingestor import SmartMaterialIngestor
from backend.agents.orchestrator import LearningOrchestrator
from backend.sample_data import seed_sample_curriculum
from backend.agent.question_bank import get_curriculum_for_exam, EXAMS_CURRICULUM

app = FastAPI(
    title="LearnSphere AI: Open-Source Multimodal Personalized Tutoring Platform",
    description="Source-grounded multimodal learning, 11 specialized AI agents, Bayesian Knowledge Tracing, 3 video tutor formats, and RAGAS evaluation.",
    version="2.5.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Singletons
vector_store = HybridVectorStore()
smart_ingestor = SmartMaterialIngestor(vector_store)
orchestrator = LearningOrchestrator(vector_store)

# Initialize Database and seed defaults on startup
init_db()
seed_sample_curriculum(vector_store)

# Pre-seed initial BKT mastery states for visual onboarding
orchestrator.learner_model.get_or_create_concept("Loss Function J(θ)", initial_prior=0.70)
orchestrator.learner_model.get_or_create_concept("Negative Gradient Update Rule", initial_prior=0.75)
orchestrator.learner_model.get_or_create_concept("Learning Rate Tuning", initial_prior=0.35)
orchestrator.learner_model.get_or_create_concept("Momentum Acceleration", initial_prior=0.48)
orchestrator.learner_model.get_or_create_concept("Backpropagation Chain Rule", initial_prior=0.62)


# ---------------- Pydantic Request / Response Models ----------------

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PreferencesRequest(BaseModel):
    preferences: Dict[str, Any]

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = None
    teaching_style: Optional[str] = "detailed"
    language: Optional[str] = "English"
    course_id: Optional[str] = "cs229-ml"

class AssessmentGenerateRequest(BaseModel):
    topic: Optional[str] = "Gradient Descent & Optimization"
    difficulty: Optional[str] = "intermediate"
    question_type: Optional[str] = "mcq"  # 'mcq', 'multi_mcq', 'short_answer', 'numerical', 'mixed'
    question_types: Optional[List[str]] = None
    num_questions: Optional[int] = 5
    target_exam: Optional[str] = "CS229 & AI/ML"
    subjects: Optional[List[str]] = None
    chapters: Optional[List[str]] = None
    source_filter: Optional[str] = "all"
    user_requirements: Optional[str] = None
    time_limit_minutes: Optional[int] = 15
    marking_scheme: Optional[str] = "standard"

class TestSubmissionRequest(BaseModel):
    target_exam: str = "CS229 & AI/ML"
    test_title: str = "Custom Assessment"
    mode: str = "cbt"  # 'cbt' or 'practice'
    total_time_seconds: int = 0
    questions: List[Dict[str, Any]]

class GradeAssessmentRequest(BaseModel):
    submission_type: str  # 'mcq', 'multi_mcq', 'short_answer', 'numerical'
    payload: Dict[str, Any]

class IntakeRequest(BaseModel):
    answers: List[Dict[str, Any]]

class VideoGenerateRequest(BaseModel):
    topic: str = "Gradient Descent Dynamics"
    style: str = "animated_concept"  # 'animated_concept', 'narrated_slides', 'animated_teacher'
    course_id: str = "cs229-ml"

class StudyScheduleRequest(BaseModel):
    days_until_exam: int = 7
    course_id: Optional[str] = "cs229-ml"

class AnalyzeNotesTextRequest(BaseModel):
    text_notes: str
    topic: Optional[str] = None
    title: Optional[str] = None


# ---------------- Authentication Endpoints ----------------

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student account."""
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role="student",
        preferences=json.dumps({
            "teaching_style": "detailed",
            "language": "English",
            "theme": "light",
            "voice_speed": 1.0,
            "auto_scaffold": True
        })
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.email, new_user.role)
    return {
        "message": "Registration successful.",
        "access_token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "preferences": new_user.get_preferences()
        }
    }

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate student and issue JWT token."""
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id, user.email, user.role)
    return {
        "message": "Login successful.",
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "preferences": user.get_preferences()
        }
    }

@app.get("/api/auth/me")
def get_me(user: User = Depends(get_current_user)):
    """Fetches profile of the currently authenticated student."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "preferences": user.get_preferences()
    }

@app.put("/api/auth/preferences")
def update_preferences(req: PreferencesRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Updates user-specific preferences (teaching style, theme, voice speed, etc.)."""
    user.set_preferences(req.preferences)
    db.commit()
    return {"message": "Preferences updated successfully.", "preferences": user.get_preferences()}


# ---------------- System Health & Ingested Sources ----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "LearnSphere AI",
        "gemini_active": gemini_client is not None,
        "indexed_chunks": len(vector_store.documents),
        "source_count": len(vector_store.get_all_sources()),
        "learner_model": "Bayesian Knowledge Tracing (BKT) Active",
        "agents_active": 11
    }

@app.get("/api/sources")
def get_sources():
    """Lists all indexed source documents, page numbers, and video timestamps."""
    return {
        "sources": vector_store.get_all_sources(),
        "total_documents": len(vector_store.documents)
    }


# ---------------- Course Library & Material Ingestion ----------------

@app.get("/api/courses")
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Lists courses belonging to the authenticated student."""
    courses = db.query(Course).filter(Course.user_id == user.id).all()
    # If student has no courses yet, return the default CS229 course
    if not courses:
        cs229 = db.query(Course).filter(Course.id == "cs229-ml").first()
        if cs229:
            courses = [cs229]

    return {
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "subject": c.subject,
                "file_count": len(c.materials) if c.materials else c.file_count,
                "created_at": c.created_at.strftime("%Y-%m-%d")
            }
            for c in courses
        ]
    }

@app.post("/api/courses/{course_id}/upload")
async def upload_material(
    course_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Uploads and processes course materials (PDF, PPTX, DOCX, TXT, MD, MP4, JSON).
    Executes extraction, chunking, and embedding generation with progress tracking.
    """
    filename = file.filename
    save_path = DATA_DIR / filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = smart_ingestor.process_file_sync(
        file_path=save_path,
        filename=filename,
        course_id=course_id,
        user_id=user.id,
        db=db
    )
    return result

@app.post("/api/notes/analyze-text")
def analyze_notes_text(req: AnalyzeNotesTextRequest):
    """
    Analyzes student notes text to produce:
    1. Important points, key concepts, formulas, and exam highlights
    2. Video tutor lesson with scenes and spoken voiceover narration
    3. Interactive study flashcards on the topic
    """
    if not req.text_notes.strip():
        raise HTTPException(status_code=400, detail="Notes text cannot be empty.")
    
    result = orchestrator.analyze_student_notes(
        text=req.text_notes,
        topic=req.topic or req.title or "Student Study Notes",
        source_name=req.title or "Pasted Notes"
    )
    return result

@app.post("/api/notes/analyze-file")
async def analyze_notes_file(
    file: UploadFile = File(...),
    topic: Optional[str] = Form(None)
):
    """
    Uploads notes file (PDF, PPTX, DOCX, TXT, MD), extracts educational content,
    and produces important points, video tutor with voiceover narration, and topic cards.
    """
    filename = file.filename
    save_path = DATA_DIR / filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ext = save_path.suffix.lower()
    extracted_text = ""
    try:
        if ext == ".pdf":
            chunks = smart_ingestor.pdf_parser.parse_pdf(save_path, source_id=filename)
            extracted_text = "\n\n".join(c["text"] for c in chunks)
        elif ext == ".pptx":
            chunks = smart_ingestor.pptx_parser.parse_pptx(save_path, source_id=filename)
            extracted_text = "\n\n".join(c["text"] for c in chunks)
        elif ext == ".docx":
            chunks = smart_ingestor.docx_parser.parse_docx(save_path, source_id=filename)
            extracted_text = "\n\n".join(c["text"] for c in chunks)
        elif ext in [".txt", ".md"]:
            chunks = smart_ingestor.text_parser.parse_text(save_path, source_id=filename)
            extracted_text = "\n\n".join(c["text"] for c in chunks)
        elif ext == ".json":
            with open(save_path, "r", encoding="utf-8") as jf:
                data = json.load(jf)
                chunks = smart_ingestor.video_processor.process_transcript_segments(data, source_name=filename)
                extracted_text = "\n\n".join(c["text"] for c in chunks)
        else:
            with open(save_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
    except Exception as e:
        print(f"[NotesExtraction] Error extracting from {filename}: {e}")
        with open(save_path, "r", encoding="utf-8", errors="ignore") as f:
            extracted_text = f.read()

    if not extracted_text.strip():
        extracted_text = f"Study notes uploaded from {filename} regarding {topic or 'course curriculum'}."

    result = orchestrator.analyze_student_notes(
        text=extracted_text,
        topic=topic or filename.rsplit(".", 1)[0],
        source_name=filename
    )
    result["filename"] = filename
    result["extracted_chars"] = len(extracted_text)
    return result

@app.get("/api/jobs")
def get_processing_jobs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Lists background document processing jobs and error logs."""
    jobs = db.query(ProcessingJob).filter(ProcessingJob.user_id == user.id).order_by(ProcessingJob.created_at.desc()).limit(20).all()
    return {
        "jobs": [
            {
                "id": j.id,
                "filename": j.filename,
                "file_type": j.file_type,
                "status": j.status,
                "stage": j.stage,
                "progress_pct": j.progress_pct,
                "message": j.message,
                "created_at": j.created_at.strftime("%H:%M:%S")
            }
            for j in jobs
        ]
    }


# ---------------- AI Tutor Workspace (Agents 2 & 3) ----------------

@app.post("/api/chat")
@app.post("/api/tutor/chat")
def tutor_chat(req: ChatRequest, user: User = Depends(get_current_user)):
    """
    RAG-grounded tutoring chat with 8 teaching styles, strict citations,
    source verification check, and out-of-material refusal guardrails.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = orchestrator.route_tutoring_query(
        query=req.query,
        history=req.history,
        teaching_style=req.teaching_style or "detailed",
        language=req.language or "English",
        course_id=req.course_id
    )
    return result


# ---------------- Video Tutor & Lesson Player (Agent 7) ----------------

@app.get("/api/video-lessons")
def list_video_lessons(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Lists educational video lessons generated across the 3 supported styles."""
    lessons = db.query(VideoLesson).filter(VideoLesson.user_id == user.id).all()
    if not lessons:
        # Return seeded lesson
        lessons = db.query(VideoLesson).all()

    return {
        "lessons": [
            {
                "id": v.id,
                "title": v.title,
                "topic": v.topic,
                "style": v.style,
                "duration_seconds": v.duration_seconds,
                "video_url": v.video_url,
                "script": v.script[:150] + "...",
                "chapters": json.loads(v.chapters_json) if v.chapters_json else [],
                "created_at": v.created_at.strftime("%Y-%m-%d")
            }
            for v in lessons
        ]
    }

@app.post("/api/video-lessons/generate")
def generate_video_lesson(req: VideoGenerateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Generates structured video lesson metadata, scene plan, chapters, and captions via Agent 7."""
    lesson_data = orchestrator.generate_video_lesson(
        topic=req.topic,
        style=req.style
    )

    # Persist in database
    v = VideoLesson(
        id=lesson_data["id"],
        course_id=req.course_id,
        user_id=user.id,
        title=lesson_data["title"],
        topic=lesson_data["topic"],
        style=lesson_data["style"],
        duration_seconds=lesson_data["duration_seconds"],
        video_url=lesson_data["video_url"],
        script=lesson_data["script"],
        chapters_json=json.dumps(lesson_data["chapters"]),
        captions_json=json.dumps(lesson_data["captions"]),
        related_citations_json=json.dumps(lesson_data["citations"])
    )
    db.add(v)
    db.commit()

    return lesson_data


# ---------------- Adaptive Assessment Engine (Agent 4) & MARKS App Architecture ----------------

@app.get("/api/quiz/exams")
def list_target_exams():
    """Lists supported target exams for MARKS custom testing."""
    return {
        "exams": [
            {"id": k, "title": v["title"], "description": v["description"], "subject_count": len(v["subjects"])}
            for k, v in EXAMS_CURRICULUM.items()
        ]
    }

@app.get("/api/quiz/curriculum")
def get_curriculum(target_exam: str = "CS229 & AI/ML"):
    """Returns subjects, chapters, PYQ counts, and weights for the target exam."""
    return get_curriculum_for_exam(target_exam)

@app.post("/api/quiz/generate")
def generate_quiz(req: AssessmentGenerateRequest):
    """Generates custom quiz strictly based on user's requirements and curriculum filters."""
    return orchestrator.generate_assessment(
        topic=req.topic or "Gradient Descent & Optimization",
        difficulty=req.difficulty or "intermediate",
        question_type=req.question_type or "mcq",
        num_questions=req.num_questions or 5,
        target_exam=req.target_exam or "CS229 & AI/ML",
        subjects=req.subjects,
        chapters=req.chapters,
        question_types=req.question_types,
        source_filter=req.source_filter or "all",
        user_requirements=req.user_requirements,
        time_limit_minutes=req.time_limit_minutes
    )

@app.post("/api/quiz/submit-test")
def submit_full_test(req: TestSubmissionRequest, db: Session = Depends(get_db)):
    """
    Submits a completed CBT or Practice test.
    Calculates total score, accuracy, negative marking, time analysis,
    and updates Bayesian Knowledge Tracing for all attempted concepts.
    """
    total_qs = len(req.questions)
    if total_qs == 0:
        raise HTTPException(status_code=400, detail="Cannot submit empty test.")

    total_marks_obtained = 0
    max_marks = 0
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0
    chapter_stats = {}
    evaluated_questions = []

    for item in req.questions:
        q_type = item.get("type", "mcq")
        user_ans = item.get("user_answer")
        correct_idx = item.get("correct_index", 0)
        correct_val = item.get("correct_value")
        correct_indices = item.get("correct_indices", [])
        concept = item.get("concept", "Core Concept")
        chapter = item.get("chapter", "General")
        difficulty = item.get("difficulty", "intermediate")
        marks_pos = item.get("marks_correct", 4)
        marks_neg = item.get("marks_incorrect", -1)

        max_marks += marks_pos

        if chapter not in chapter_stats:
            chapter_stats[chapter] = {"total": 0, "correct": 0, "incorrect": 0, "unattempted": 0, "score": 0}
        chapter_stats[chapter]["total"] += 1

        is_answered = (user_ans is not None and user_ans != "" and user_ans != [])
        is_correct = False
        marks_delta = 0

        if not is_answered:
            unattempted_count += 1
            chapter_stats[chapter]["unattempted"] += 1
        else:
            if q_type == "mcq":
                is_correct = (user_ans == correct_idx)
            elif q_type == "multi_mcq":
                user_set = set(user_ans if isinstance(user_ans, list) else [user_ans])
                correct_set = set(correct_indices)
                is_correct = (user_set == correct_set)
            elif q_type == "numerical":
                try:
                    u_val = float(user_ans)
                    c_val = float(correct_val or 0.0)
                    tol = float(item.get("tolerance", 0.05))
                    is_correct = abs(u_val - c_val) <= tol
                except Exception:
                    is_correct = False
            elif q_type == "short_answer":
                u_str = str(user_ans).lower()
                rubric = item.get("rubric_points", [])
                matched = [p for p in rubric if any(w in u_str for w in p.lower().split() if len(w) > 4)]
                is_correct = len(matched) >= max(1, len(rubric) // 2)

            if is_correct:
                correct_count += 1
                marks_delta = marks_pos
                chapter_stats[chapter]["correct"] += 1
            else:
                incorrect_count += 1
                marks_delta = marks_neg
                chapter_stats[chapter]["incorrect"] += 1

            total_marks_obtained += marks_delta
            chapter_stats[chapter]["score"] += marks_delta

            # Update BKT Learner Model
            orchestrator.learner_model.update_mastery(concept, is_correct, difficulty=difficulty)

        evaluated_questions.append({
            **item,
            "is_answered": is_answered,
            "is_correct": is_correct,
            "marks_awarded": marks_delta
        })

    accuracy_pct = (correct_count / (correct_count + incorrect_count) * 100.0) if (correct_count + incorrect_count) > 0 else 0.0
    score_pct = (total_marks_obtained / max_marks * 100.0) if max_marks > 0 else 0.0

    percentile = min(99.9, max(10.0, 50.0 + (score_pct * 0.48)))

    return {
        "target_exam": req.target_exam,
        "test_title": req.test_title,
        "mode": req.mode,
        "total_time_seconds": req.total_time_seconds,
        "total_questions": total_qs,
        "max_marks": max_marks,
        "marks_obtained": total_marks_obtained,
        "accuracy_pct": round(accuracy_pct, 1),
        "score_pct": round(score_pct, 1),
        "percentile_estimate": round(percentile, 1),
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "unattempted_count": unattempted_count,
        "chapter_stats": chapter_stats,
        "evaluated_questions": evaluated_questions
    }

@app.post("/api/quiz/grade")
def grade_assessment(req: GradeAssessmentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Evaluates question, updates BKT mastery, and provides scaffolding remediation if wrong."""
    result = orchestrator.grade_assessment_submission(
        submission_type=req.submission_type,
        payload=req.payload
    )

    # Log quiz record
    try:
        record = QuizRecord(
            id=f"rec_{int(time.time() * 1000)}",
            user_id=user.id,
            course_id="cs229-ml",
            topic=req.payload.get("concept", "Optimization"),
            question_type=req.submission_type,
            score_pct=100.0 if result.get("is_correct") else 0.0,
            answers_json=json.dumps(req.payload),
            bkt_updates_json=json.dumps(result.get("bkt_mastery", {}))
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"[QuizRecord Warning] Failed to save quiz record: {e}")

    return result

# Legacy endpoints for backward compatibility
@app.post("/api/quiz/grade-short-answer")
def grade_short_answer(req: Dict[str, Any], user: User = Depends(get_current_user)):
    return orchestrator.grade_assessment_submission("short_answer", req)

@app.post("/api/quiz/grade-numerical")
def grade_numerical(req: Dict[str, Any], user: User = Depends(get_current_user)):
    return orchestrator.grade_assessment_submission("numerical", req)


# ---------------- Learner Model & Bayesian Knowledge Tracing (Agent 5) ----------------

@app.get("/api/learner/profile")
def get_learner_profile():
    """Returns Bayesian Knowledge Tracing (BKT) learner state, forgetting curves, and tracking."""
    return orchestrator.learner_model.get_full_profile()

@app.post("/api/learner/intake")
def apply_diagnostic_intake(req: IntakeRequest):
    """Calibrates initial mastery priors for new students without prior learning history."""
    return orchestrator.learner_model.apply_diagnostic_intake(req.answers)

@app.get("/api/gap-report")
def get_gap_report():
    """Produces end-of-session Knowledge Gap Report with exact video timestamps and pages."""
    return orchestrator.assessment_engine.generate_knowledge_gap_report()


# ---------------- Interactive Concept Map (Agent 8) ----------------

@app.get("/api/course-flow")
def get_course_flow():
    """Returns visual Concept Flow Map (DAG) overlaying live BKT mastery tiers."""
    return orchestrator.get_concept_dag()

@app.get("/api/course-flow/diagrams")
def get_diagrams():
    """Returns extracted figures, diagrams, and equations catalog."""
    return {"diagrams": orchestrator.course_graph.get_diagrams()}


# ---------------- Revision Resources & Study Planner (Agents 6 & 9) ----------------

@app.get("/api/revision/flashcards")
def get_flashcards(count: int = 6):
    """Generates active recall flashcards prioritized for weak concepts."""
    return {"flashcards": orchestrator.assessment_engine.generate_flashcards(count=count)}

@app.get("/api/revision/audio-brief")
def get_audio_brief(topic: str = "Optimization Fundamentals"):
    """Generates 2-minute spoken revision script with citations for audio tutoring."""
    return orchestrator.assessment_engine.generate_audio_brief_script(topic=topic)

@app.post("/api/revision/study-schedule")
def get_study_schedule(req: StudyScheduleRequest):
    """Generates spaced-repetition study schedule based on forgetting curves and exam date."""
    schedule = orchestrator.assessment_engine.generate_study_schedule(days_until_exam=req.days_until_exam)
    return {"schedule": schedule, "days": req.days_until_exam}


# ---------------- Evaluation & Benchmarking (Agent 11) ----------------

@app.get("/api/eval/benchmark")
def run_benchmark():
    """Runs RAGAS-compatible benchmark measuring faithfulness, relevancy, precision, recall, and refusal accuracy."""
    return orchestrator.benchmark_runner.run_benchmark()

@app.get("/api/eval/simulate-students")
def run_student_simulations():
    """Simulates 3 student personas across 5 sessions to measure mastery gains and 0% repetition rate."""
    return orchestrator.benchmark_runner.run_simulated_student_profiles()


# ---------------- Notifications ----------------

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Fetches user notifications."""
    notifs = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "category": n.category,
                "read": n.read,
                "link": n.link,
                "created_at": n.created_at.strftime("%b %d, %H:%M")
            }
            for n in notifs
        ]
    }

@app.post("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    """Marks a notification as read."""
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.read = True
        db.commit()
    return {"status": "success"}


# ---------------- Production Static Frontend Serving ----------------
from fastapi.staticfiles import StaticFiles
from backend.config import BASE_DIR

frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
