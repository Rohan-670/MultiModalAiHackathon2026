from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.agents.source_verification import SourceVerificationAgent
from backend.agents.personalized_tutor import PersonalizedTutorAgent
from backend.agents.video_tutor import VideoTutorAgent
from backend.agents.notes_analyzer import NotesAnalyzerAgent
from backend.learner_model.bkt_engine import BayesianKnowledgeTracer
from backend.knowledge_graph.course_graph import CourseFlowManager
from backend.agent.evaluator import AdaptiveAssessmentEngine
from backend.evaluation.benchmark import BenchmarkRunner

class LearningOrchestrator:
    """
    Central AI Learning Orchestrator for LearnSphere AI
    Coordinates the 11 specialized AI agents across the student lifecycle:
    - Ingestion & Extraction (Agent 1)
    - Source Verification (Agent 2)
    - Personalized Tutoring (Agent 3)
    - Assessment Generation & Quality (Agent 4)
    - Learner Intelligence & BKT (Agent 5)
    - Study Planning (Agent 6)
    - Video Lesson Generation (Agent 7)
    - Concept Mapping (Agent 8)
    - Revision Resources (Agent 9)
    - Voice & Language (Agent 10)
    - Evaluation & Benchmarking (Agent 11)
    """

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.verifier = SourceVerificationAgent()
        self.tutor = PersonalizedTutorAgent(vector_store, verifier=self.verifier)
        self.learner_model = BayesianKnowledgeTracer()
        self.assessment_engine = AdaptiveAssessmentEngine(vector_store, learner_model=self.learner_model)
        self.course_graph = CourseFlowManager()
        self.video_agent = VideoTutorAgent(vector_store)
        self.benchmark_runner = BenchmarkRunner(self.tutor, vector_store)
        self.notes_analyzer = NotesAnalyzerAgent(vector_store)

    def route_tutoring_query(
        self,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        teaching_style: str = "detailed",
        language: str = "English",
        course_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Routes conversational inquiry through Tutor Agent & Verification Agent."""
        result = self.tutor.answer_query(
            query=query,
            history=history,
            teaching_style=teaching_style,
            language=language,
            course_id=course_id
        )

        # Update BKT learner model for study engagement
        if not result.get("is_off_material") and result.get("citations"):
            top_source = result["citations"][0].get("source_name", "Optimization")
            self.learner_model.update_from_conversation(top_source, engagement_level=0.5)

        return result

    def generate_assessment(
        self,
        topic: str = "Gradient Descent & Optimization",
        difficulty: str = "intermediate",
        question_type: str = "mcq",
        num_questions: int = 3,
        target_exam: str = "CS229 & AI/ML",
        subjects: Optional[List[str]] = None,
        chapters: Optional[List[str]] = None,
        question_types: Optional[List[str]] = None,
        source_filter: str = "all",
        user_requirements: Optional[str] = None,
        time_limit_minutes: Optional[int] = None
    ) -> Dict[str, Any]:
        """Delegates assessment generation to Agent 4 with custom user requirements."""
        questions = self.assessment_engine.generate_quiz(
            topic=topic,
            difficulty=difficulty,
            question_type=question_type,
            num_questions=num_questions,
            target_exam=target_exam,
            subjects=subjects,
            chapters=chapters,
            question_types=question_types,
            source_filter=source_filter,
            user_requirements=user_requirements,
            time_limit_minutes=time_limit_minutes
        )
        return {
            "topic": topic,
            "target_exam": target_exam,
            "difficulty": difficulty,
            "question_type": question_type,
            "user_requirements": user_requirements,
            "total_questions": len(questions),
            "questions": questions
        }

    def grade_assessment_submission(
        self,
        submission_type: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Grades MCQ, Multi-MCQ, Short Answer, or Numerical question and updates BKT learner model."""
        if submission_type == "numerical":
            return self.assessment_engine.grade_numerical(
                question_text=payload["question_text"],
                user_value=payload["user_value"],
                correct_value=payload["correct_value"],
                tolerance=payload.get("tolerance", 0.05),
                concept=payload["concept"],
                citation=payload["citation"],
                calculation_steps=payload.get("calculation_steps", "")
            )
        elif submission_type == "short_answer":
            return self.assessment_engine.grade_short_answer(
                question_text=payload["question_text"],
                user_answer=payload["user_answer"],
                rubric_points=payload.get("rubric_points", []),
                concept=payload["concept"],
                citation=payload["citation"]
            )
        elif submission_type == "multi_mcq":
            return self.assessment_engine.grade_multi_mcq(
                question_id=payload["question_id"],
                question_text=payload["question_text"],
                user_selected_indices=payload.get("user_selected_indices", []),
                correct_indices=payload.get("correct_indices", []),
                concept=payload["concept"],
                explanation=payload.get("explanation", ""),
                citation=payload.get("citation", "[Verified Curriculum]"),
                difficulty=payload.get("difficulty", "advanced")
            )
        else:
            return self.assessment_engine.grade_answer(
                question_id=payload["question_id"],
                question_text=payload["question_text"],
                user_answer_index=payload["user_answer_index"],
                correct_index=payload["correct_index"],
                concept=payload["concept"],
                explanation=payload["explanation"],
                citation=payload["citation"],
                difficulty=payload.get("difficulty", "intermediate")
            )

    def generate_video_lesson(
        self,
        topic: str,
        style: str = "animated_concept",
        weak_concept: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generates video lesson metadata and narration script via Agent 7."""
        return self.video_agent.generate_lesson_plan(
            topic=topic,
            style=style,
            weak_concept=weak_concept
        )

    def get_concept_dag(self) -> Dict[str, Any]:
        """Generates visual concept flow DAG via Agent 8 overlaying BKT mastery."""
        profile = self.learner_model.get_full_profile()
        return self.course_graph.get_flow_graph(profile)

    def get_revision_suite(self, exam_days: int = 7) -> Dict[str, Any]:
        """Generates flashcards, audio brief, and study schedule via Agent 6 & 9."""
        return {
            "flashcards": self.assessment_engine.generate_flashcards(count=6),
            "audio_brief": self.assessment_engine.generate_audio_brief_script(),
            "study_schedule": self.assessment_engine.generate_study_schedule(days_until_exam=exam_days)
        }

    def run_system_evaluation(self) -> Dict[str, Any]:
        """Executes RAGAS benchmark & multi-session student simulation via Agent 11."""
        benchmark_results = self.benchmark_runner.run_benchmark()
        simulation_results = self.benchmark_runner.run_simulated_student_profiles()
        return {
            "ragas_benchmark": benchmark_results,
            "student_simulation": simulation_results
        }

    def analyze_student_notes(self, text: str, topic: Optional[str] = None, source_name: str = "Student Notes") -> Dict[str, Any]:
        """Extracts important points, generates voiceover video script, and creates topic study cards."""
        return self.notes_analyzer.analyze_notes(text, topic=topic, source_name=source_name)
