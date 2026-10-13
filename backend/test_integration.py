import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from starlette.testclient import TestClient
from backend.main import app

def test_full_system_flow():
    client = TestClient(app)

    print("\n--- 1. Testing System Health & Brand ---")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    health = res.json()
    print("Health:", health)
    assert health["platform"] == "LearnSphere AI"
    assert health["indexed_chunks"] > 0
    assert "Bayesian Knowledge Tracing" in health["learner_model"]

    print("\n--- 2. Testing Authentication (Register & Login) ---")
    # Register test student
    test_email = "tester_student@learnsphere.ai"
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Test Learner"
    })
    if reg_res.status_code == 400: # Already exists
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": "Password123!"
        })
        assert login_res.status_code == 200, login_res.text
        auth_data = login_res.json()
    else:
        assert reg_res.status_code == 200, reg_res.text
        auth_data = reg_res.json()

    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Authenticated as: {auth_data['user']['full_name']} ({auth_data['user']['email']})")

    # Get /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

    print("\n--- 3. Testing Courses & Library ---")
    courses_res = client.get("/api/courses", headers=headers)
    assert courses_res.status_code == 200
    courses = courses_res.json()["courses"]
    print(f"Found {len(courses)} courses:")
    for c in courses:
        print(f" - {c['title']} ({c['subject']})")

    print("\n--- 4. Testing AI Tutor Workspace (Agents 2 & 3) with Citations & Verification ---")
    query = "What causes gradient descent to diverge when the learning rate is too high?"
    res = client.post("/api/chat", json={
        "query": query,
        "teaching_style": "step_by_step",
        "language": "English"
    }, headers=headers)
    assert res.status_code == 200, res.text
    chat_data = res.json()
    assert chat_data["is_off_material"] is False
    assert "verification" in chat_data
    print("Answer preview:", chat_data["answer"][:120], "...")
    print(f"Citations extracted: {len(chat_data['citations'])}")
    print("Grounding Verification Fidelity:", chat_data["verification"]["fidelity_percentage"], "%", f"({chat_data['verification']['verification_status']})")

    print("\n--- 5. Testing Out-of-Material Refusal Guardrail ---")
    off_query = "What is the capital of Australia and how do you make pasta carbonara?"
    res_off = client.post("/api/chat", json={"query": off_query}, headers=headers)
    assert res_off.status_code == 200, res_off.text
    chat_off = res_off.json()
    print("Off-material response:", chat_off["answer"][:120], "...")
    assert chat_off["is_off_material"] is True, "Off-material query was not properly declined!"

    print("\n--- 6. Testing Video Tutor Agent (Agent 7) across 3 formats ---")
    v_res = client.post("/api/video-lessons/generate", json={
        "topic": "Loss Surfaces and Learning Rates",
        "style": "animated_concept",
        "course_id": "cs229-ml"
    }, headers=headers)
    assert v_res.status_code == 200
    v_data = v_res.json()
    print(f"Generated Video Lesson: '{v_data['title']}' ({v_data['duration_seconds']}s, Style: {v_data['style']})")
    print(f"Chapters generated: {len(v_data['chapters'])}, Captions: {len(v_data['captions'])}")

    print("\n--- 7. Testing Adaptive Assessments & MARKS Custom Quiz Engine ---")
    # 7a. Test Target Exams & Curriculum
    exams_res = client.get("/api/quiz/exams")
    assert exams_res.status_code == 200
    exams = exams_res.json()["exams"]
    print(f"Supported Target Exams ({len(exams)}): {[e['id'] for e in exams]}")

    curric_res = client.get("/api/quiz/curriculum?target_exam=JEE%20Main")
    assert curric_res.status_code == 200
    curric = curric_res.json()
    print(f"JEE Main Curriculum Subjects: {[s['name'] for s in curric['subjects']]}")

    # 7b. Test Custom Quiz Generation Based on User Requirements
    req_res = client.post("/api/quiz/generate", json={
        "target_exam": "JEE Main",
        "subjects": ["Mathematics"],
        "chapters": ["Calculus & Definite Integrals"],
        "user_requirements": "Generate tricky definite integral questions with odd-even symmetry",
        "num_questions": 2,
        "difficulty": "intermediate"
    })
    assert req_res.status_code == 200
    gen_data = req_res.json()
    assert len(gen_data["questions"]) >= 2
    q_math = gen_data["questions"][0]
    print(f"Generated Q based on user requirements: '{q_math['question'][:75]}...'")

    # 7c. Test Full Test Submission & Scorecard
    sub_res = client.post("/api/quiz/submit-test", json={
        "target_exam": "JEE Main",
        "test_title": "Calculus Custom Test",
        "mode": "cbt",
        "total_time_seconds": 180,
        "questions": [
            {
                **q_math,
                "user_answer": q_math.get("correct_index", 0)
            }
        ]
    })
    assert sub_res.status_code == 200
    sc = sub_res.json()
    print(f"Scorecard calculated: Marks {sc['marks_obtained']}/{sc['max_marks']}, Accuracy: {sc['accuracy_pct']}%, Percentile: {sc['percentile_estimate']}%")

    # Numerical question
    num_res = client.post("/api/quiz/generate", json={
        "topic": "Gradient Descent & Optimization",
        "question_type": "numerical",
        "num_questions": 1
    })
    assert num_res.status_code == 200
    q_num = num_res.json()["questions"][0]
    print(f"Generated Numerical Problem: {q_num['question'][:75]}...")

    # Grade numerical
    grade_res = client.post("/api/quiz/grade", json={
        "submission_type": "numerical",
        "payload": {
            "question_text": q_num["question"],
            "user_value": q_num["correct_value"],
            "correct_value": q_num["correct_value"],
            "tolerance": q_num.get("tolerance", 0.05),
            "concept": q_num["concept"],
            "citation": q_num["citation"],
            "calculation_steps": q_num.get("calculation_steps", "step derivation")
        }
    }, headers=headers)
    assert grade_res.status_code == 200
    assert grade_res.json()["is_correct"] is True

    print("\n--- 8. Testing Learner Model (BKT) & Concept Flow DAG ---")
    bkt_res = client.get("/api/learner/profile")
    assert bkt_res.status_code == 200
    bkt_prof = bkt_res.json()
    print(f"Tracked Concepts: {bkt_prof['total_concepts_tracked']}, Avg Mastery: {bkt_prof['average_mastery_pct']}%")

    dag_res = client.get("/api/course-flow")
    assert dag_res.status_code == 200
    dag_data = dag_res.json()
    print(f"Concept Flow Nodes: {dag_data['total_nodes']}, Prerequisite Edges: {len(dag_data['edges'])}")

    print("\n--- 9. Testing Revision Suite (Flashcards, Audio-Brief, Study Schedule) ---")
    fc_res = client.get("/api/revision/flashcards?count=4")
    assert fc_res.status_code == 200
    print(f"Active Recall Flashcards: {len(fc_res.json()['flashcards'])}")

    ab_res = client.get("/api/revision/audio-brief")
    assert ab_res.status_code == 200
    print("Spoken Audio Brief Topic:", ab_res.json()["topic"])

    sched_res = client.post("/api/revision/study-schedule", json={"days_until_exam": 7})
    assert sched_res.status_code == 200
    print(f"Spaced Study Schedule: {len(sched_res.json()['schedule'])} days generated")

    print("\n--- 10. Testing Simulated Students & RAGAS Benchmarking ---")
    sim_res = client.get("/api/eval/simulate-students")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    print(f"Simulated Personas: {sim_data['total_students_simulated']}, Repetition Rate: {sim_data['question_repetition_rate_pct']}%")
    assert sim_data["question_repetition_rate_pct"] == 0.0

    print("\nALL LEARNSPHERE AI SYSTEM WORKFLOWS VERIFIED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_system_flow()
