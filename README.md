# LearnSphere MARKS — AI Exam Assessment & Custom Test Platform

A full-stack, AI-powered exam preparation and adaptive testing platform inspired by the concept of [MARKS](https://web.getmarks.app/). Built for serious competitive exam aspirants (JEE Main, JEE Advanced, NEET UG, GATE CS & AI, and Computer Science).

Features on-demand quiz and mock test generation tailored to custom user requirements, an authentic NTA-style Computer-Based Test (CBT) simulator, instant step-by-step mathematical explanations, and Bayesian Knowledge Tracing (BKT).

---

## 🌟 Key Features

### 1. Custom Test Generator with User Requirements
* **Prompt-Driven Test Customization**: Type natural language instructions (e.g. *"Focus on rotational dynamics with tricky torque problems"*, *"Derive loss gradients with edge cases"*, *"Include assertion-reason questions on thermodynamics"*).
* **Multi-Exam Architecture**: Seamlessly switch between **JEE Main**, **JEE Advanced**, **NEET UG**, **GATE CS & AI**, and **CS229 AI/ML**.
* **Granular Chapter Selection**: Select individual subjects and chapters with live chapter search and question count controls.
* **Flexible Question Formats**: Generate Single-Choice MCQs, Multiple-Correct Questions, Numerical Integer problems, and Conceptual Short-Answers.

### 2. Authentic NTA Computer-Based Test (CBT) Simulator
* **5-Color State Palette**: Accurate NTA question grid tracking *Unvisited*, *Not Answered*, *Answered*, *Marked for Review*, and *Answered & Marked for Review*.
* **Exam Utilities**: Synchronized countdown timer, Question Paper overview modal, virtual scientific calculator, and quick-reference formula sheets.
* **Comprehensive Test Submission**: Interactive review summary and instant scoring.

### 3. Practice Mode with KaTeX Formula Rendering
* **Instant Step-by-Step Solutions**: Immediate feedback with clear conceptual derivations and formula breakdowns rendered via KaTeX.
* **Hint Scaffolding**: Progressive hints that guide student intuition before revealing full answers.
* **Smart Notebook / Mistake Book**: One-click bookmarking of incorrect or tricky questions for targeted revision.

### 4. Detailed Post-Test Scorecards & Analytics
* **Performance Metrics**: Overall score, accuracy percentage, time spent, and projected percentile.
* **Subject & Chapter Breakdown**: Identifies strong areas and critical knowledge gaps.
* **Retest Mistakes**: Instantly launches a focused remediation drill containing only the questions missed in the test.

### 5. Bayesian Knowledge Tracing (BKT) Engine
* **Dynamic Student Modeling**: Quantifies mastery probability $P(L_t) \in [0.0, 1.0]$ after every question.
* **Ebbinghaus Forgetting Curves**: Models memory retrievability $R(t)$ over time to schedule optimal spaced repetition.

---

## 🏗️ Project Architecture

```
learnsphere-marks/
│
├── backend/                        # FastAPI REST API & Gemini Quiz Engine
│   ├── agent/
│   │   ├── question_bank.py        # Multi-exam curriculum metadata & fallback questions
│   │   ├── evaluator.py            # Gemini 3.5 Flash Lite prompt-driven quiz generator
│   │   └── tutor_graph.py          # Grounded tutor chat & multilingual engine
│   ├── learner_model/
│   │   └── bkt_engine.py           # Bayesian Knowledge Tracing (BKT) engine
│   ├── vectorstore/                # Hybrid dense-sparse retrieval system
│   ├── database/                   # SQLite database & SQLAlchemy ORM
│   ├── config.py                   # Environment and Gemini client configuration
│   └── main.py                     # FastAPI server with production SPA static mounting
│
├── frontend/                       # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarksQuizModule.tsx # Core MARKS Custom Test & CBT Simulator module
│   │   │   ├── MathRenderer.tsx    # KaTeX mathematical formula renderer
│   │   │   ├── Navbar.tsx          # Clean exam prep header & theme toggle
│   │   │   ├── StudentDashboard.tsx# Exam progress, mastery stats, & action cards
│   │   │   └── ChatInterface.tsx   # Grounded tutor chat with formula derivations
│   │   ├── types.ts                # TypeScript interfaces (Exams, Curricula, Scorecards)
│   │   └── App.tsx                 # Root layout & tab router
│   ├── vite.config.ts
│   └── package.json
│
├── Dockerfile                      # Production multi-stage build (Node + Python)
├── docker-compose.yml              # Container orchestration
├── DEPLOYMENT.md                   # Step-by-step deployment and publishing guide
└── requirements.txt                # Python backend dependencies
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm
* **Google Gemini API Key** ([Get free key here](https://aistudio.google.com/app/apikey))

### 2. Environment Setup
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```

### 3. Run Locally (Unified Single-Port Mode)
```bash
# 1. Install backend requirements
pip install -r requirements.txt

# 2. Build the React frontend
cd frontend
npm install
npm run build
cd ..

# 3. Start the unified server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Open **`http://localhost:8000`** in your browser. Both the MARKS UI and the API endpoints are served together seamlessly.

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quiz/exams` | Lists available target exams (JEE Main, Advanced, NEET, GATE, CS229) |
| `GET` | `/api/quiz/curriculum?exam=JEE+Main` | Fetches subjects and chapters for the chosen target exam |
| `POST` | `/api/quiz/generate` | Generates custom tests tailored to user prompt requirements |
| `POST` | `/api/quiz/submit-test` | Evaluates CBT mock submissions and computes percentile scorecards |
| `POST` | `/api/quiz/grade` | Grades practice questions and updates BKT mastery posteriors |
| `GET` | `/api/learner/profile` | Returns current student BKT mastery probabilities |
| `POST` | `/api/chat` | AI tutor chat with LaTeX formula derivations |

---

## 📄 License
MIT License. Built for education and open-source learning.
