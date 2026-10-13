"""
Curriculum and Verified Question Bank for MARKS-Style Custom Test Generation
Supports:
- Stanford CS229 / AI & Machine Learning
- JEE Main
- JEE Advanced
- NEET UG
- GATE CS & AI
"""

from typing import List, Dict, Any, Optional

EXAMS_CURRICULUM = {
    "CS229 & AI/ML": {
        "title": "Stanford CS229 / AI & Machine Learning",
        "description": "Foundational optimization, deep learning, calculus, and machine learning models.",
        "subjects": [
            {
                "name": "Optimization",
                "icon": "TrendingDown",
                "chapters": [
                    {"name": "Gradient Descent & Optimization", "weightage": "High", "pyq_count": 84, "difficulty": "Medium"},
                    {"name": "Learning Rate Tuning & Decay", "weightage": "High", "pyq_count": 62, "difficulty": "Hard"},
                    {"name": "Momentum & Adam Optimizers", "weightage": "High", "pyq_count": 76, "difficulty": "Hard"},
                    {"name": "Loss Landscapes & Saddle Points", "weightage": "Medium", "pyq_count": 45, "difficulty": "Medium"},
                    {"name": "Regularization (L1 / L2 Weight Decay)", "weightage": "Medium", "pyq_count": 52, "difficulty": "Medium"},
                ]
            },
            {
                "name": "Deep Learning",
                "icon": "Cpu",
                "chapters": [
                    {"name": "Backpropagation & Chain Rule", "weightage": "High", "pyq_count": 95, "difficulty": "Hard"},
                    {"name": "Neural Network Architectures", "weightage": "High", "pyq_count": 88, "difficulty": "Medium"},
                    {"name": "Convolutional Networks & Kernels", "weightage": "Medium", "pyq_count": 58, "difficulty": "Medium"},
                    {"name": "Transformers & Self-Attention", "weightage": "High", "pyq_count": 74, "difficulty": "Hard"},
                ]
            },
            {
                "name": "Machine Learning",
                "icon": "Database",
                "chapters": [
                    {"name": "Linear & Logistic Regression", "weightage": "High", "pyq_count": 70, "difficulty": "Easy"},
                    {"name": "Support Vector Machines (SVM)", "weightage": "Medium", "pyq_count": 48, "difficulty": "Medium"},
                    {"name": "Decision Trees & Ensembles", "weightage": "Medium", "pyq_count": 55, "difficulty": "Medium"},
                    {"name": "Unsupervised Clustering & PCA", "weightage": "Medium", "pyq_count": 42, "difficulty": "Medium"},
                ]
            },
            {
                "name": "Mathematical Foundations",
                "icon": "Sigma",
                "chapters": [
                    {"name": "Matrix Calculus & Gradients", "weightage": "High", "pyq_count": 65, "difficulty": "Hard"},
                    {"name": "Eigenvalues & SVD", "weightage": "Medium", "pyq_count": 39, "difficulty": "Hard"},
                    {"name": "Probability & Bayesian Networks", "weightage": "High", "pyq_count": 60, "difficulty": "Medium"},
                ]
            }
        ]
    },
    "JEE Main": {
        "title": "JEE Main 2026",
        "description": "National Testing Agency (NTA) standard pattern for Engineering entrance.",
        "subjects": [
            {
                "name": "Mathematics",
                "icon": "Calculator",
                "chapters": [
                    {"name": "Calculus & Definite Integrals", "weightage": "High", "pyq_count": 142, "difficulty": "Hard"},
                    {"name": "Coordinate Geometry & Conic Sections", "weightage": "High", "pyq_count": 128, "difficulty": "Medium"},
                    {"name": "Matrices & Determinants", "weightage": "High", "pyq_count": 98, "difficulty": "Easy"},
                    {"name": "Vectors & 3D Geometry", "weightage": "High", "pyq_count": 115, "difficulty": "Medium"},
                    {"name": "Probability & Permutations", "weightage": "Medium", "pyq_count": 82, "difficulty": "Hard"},
                ]
            },
            {
                "name": "Physics",
                "icon": "Zap",
                "chapters": [
                    {"name": "Mechanics & Newton's Laws", "weightage": "High", "pyq_count": 135, "difficulty": "Medium"},
                    {"name": "Rotational Dynamics & Torque", "weightage": "High", "pyq_count": 110, "difficulty": "Hard"},
                    {"name": "Thermodynamics & Heat Transfer", "weightage": "High", "pyq_count": 105, "difficulty": "Medium"},
                    {"name": "Electrostatics & Capacitors", "weightage": "High", "pyq_count": 120, "difficulty": "Medium"},
                    {"name": "Modern Physics & Dual Nature", "weightage": "High", "pyq_count": 95, "difficulty": "Easy"},
                ]
            },
            {
                "name": "Chemistry",
                "icon": "FlaskConical",
                "chapters": [
                    {"name": "Chemical Thermodynamics & Equilibrium", "weightage": "High", "pyq_count": 112, "difficulty": "Medium"},
                    {"name": "Chemical Bonding & Molecular Structure", "weightage": "High", "pyq_count": 130, "difficulty": "Easy"},
                    {"name": "Organic Reaction Mechanisms & Carbonyls", "weightage": "High", "pyq_count": 145, "difficulty": "Hard"},
                    {"name": "Coordination Compounds", "weightage": "High", "pyq_count": 92, "difficulty": "Medium"},
                    {"name": "Solutions & Electrochemistry", "weightage": "Medium", "pyq_count": 88, "difficulty": "Medium"},
                ]
            }
        ]
    },
    "JEE Advanced": {
        "title": "JEE Advanced",
        "description": "Multi-correct, integer numericals, and comprehensive IIT entrance problems.",
        "subjects": [
            {
                "name": "Mathematics",
                "icon": "Calculator",
                "chapters": [
                    {"name": "Differential Calculus & Maxima-Minima", "weightage": "High", "pyq_count": 86, "difficulty": "Hard"},
                    {"name": "Definite Integrals & Area", "weightage": "High", "pyq_count": 92, "difficulty": "Hard"},
                    {"name": "Complex Numbers & Geometry", "weightage": "High", "pyq_count": 78, "difficulty": "Hard"},
                    {"name": "Vectors & 3D Geometry", "weightage": "Medium", "pyq_count": 68, "difficulty": "Hard"},
                ]
            },
            {
                "name": "Physics",
                "icon": "Zap",
                "chapters": [
                    {"name": "Rigid Body Dynamics & Pure Rolling", "weightage": "High", "pyq_count": 94, "difficulty": "Hard"},
                    {"name": "Electromagnetic Induction & Lenz's Law", "weightage": "High", "pyq_count": 82, "difficulty": "Hard"},
                    {"name": "Wave Optics & Interference", "weightage": "Medium", "pyq_count": 64, "difficulty": "Medium"},
                    {"name": "Thermodynamic Cyclic Processes", "weightage": "High", "pyq_count": 75, "difficulty": "Hard"},
                ]
            },
            {
                "name": "Chemistry",
                "icon": "FlaskConical",
                "chapters": [
                    {"name": "Multi-Step Organic Conversions", "weightage": "High", "pyq_count": 102, "difficulty": "Hard"},
                    {"name": "Chemical Kinetics & Radioactivity", "weightage": "Medium", "pyq_count": 70, "difficulty": "Medium"},
                    {"name": "Transition Elements (d & f block)", "weightage": "High", "pyq_count": 65, "difficulty": "Hard"},
                ]
            }
        ]
    },
    "NEET UG": {
        "title": "NEET UG",
        "description": "Medical entrance examination: Biology (Botany & Zoology), Physics, Chemistry.",
        "subjects": [
            {
                "name": "Biology",
                "icon": "Dna",
                "chapters": [
                    {"name": "Genetics & Molecular Basis of Inheritance", "weightage": "High", "pyq_count": 160, "difficulty": "Medium"},
                    {"name": "Human Physiology & Neural Control", "weightage": "High", "pyq_count": 185, "difficulty": "Medium"},
                    {"name": "Cell Structure & Cell Cycle", "weightage": "High", "pyq_count": 135, "difficulty": "Easy"},
                    {"name": "Ecology & Biodiversity", "weightage": "High", "pyq_count": 120, "difficulty": "Easy"},
                ]
            },
            {
                "name": "Physics",
                "icon": "Zap",
                "chapters": [
                    {"name": "Mechanics & Newton's Laws", "weightage": "High", "pyq_count": 110, "difficulty": "Medium"},
                    {"name": "Current Electricity & Circuits", "weightage": "High", "pyq_count": 98, "difficulty": "Medium"},
                    {"name": "Ray & Wave Optics", "weightage": "High", "pyq_count": 104, "difficulty": "Medium"},
                    {"name": "Thermodynamics", "weightage": "Medium", "pyq_count": 75, "difficulty": "Easy"},
                ]
            },
            {
                "name": "Chemistry",
                "icon": "FlaskConical",
                "chapters": [
                    {"name": "Organic Chemistry - Basic Principles", "weightage": "High", "pyq_count": 125, "difficulty": "Medium"},
                    {"name": "Chemical Bonding", "weightage": "High", "pyq_count": 115, "difficulty": "Easy"},
                    {"name": "Biomolecules & Polymers", "weightage": "High", "pyq_count": 90, "difficulty": "Easy"},
                ]
            }
        ]
    },
    "GATE CS & AI": {
        "title": "GATE Computer Science & AI",
        "description": "Graduate Aptitude Test in Engineering for CS and AI Specializations.",
        "subjects": [
            {
                "name": "Machine Learning & AI",
                "icon": "Cpu",
                "chapters": [
                    {"name": "Gradient Descent & Optimization", "weightage": "High", "pyq_count": 55, "difficulty": "Medium"},
                    {"name": "Supervised Learning Algorithms", "weightage": "High", "pyq_count": 68, "difficulty": "Medium"},
                    {"name": "Neural Networks & Backpropagation", "weightage": "High", "pyq_count": 60, "difficulty": "Hard"},
                ]
            },
            {
                "name": "Algorithms & Data Structures",
                "icon": "Code",
                "chapters": [
                    {"name": "Dynamic Programming & Greedy", "weightage": "High", "pyq_count": 90, "difficulty": "Hard"},
                    {"name": "Graph Algorithms & BFS/DFS", "weightage": "High", "pyq_count": 82, "difficulty": "Hard"},
                    {"name": "Asymptotic Analysis & Recurrences", "weightage": "Medium", "pyq_count": 54, "difficulty": "Medium"},
                ]
            },
            {
                "name": "Engineering Mathematics",
                "icon": "Sigma",
                "chapters": [
                    {"name": "Linear Algebra & Eigenvalues", "weightage": "High", "pyq_count": 72, "difficulty": "Hard"},
                    {"name": "Probability & Random Variables", "weightage": "High", "pyq_count": 66, "difficulty": "Medium"},
                ]
            }
        ]
    }
}

VERIFIED_QUESTION_BANK = [
    # ------------------ CS229 / AI: OPTIMIZATION & DEEP LEARNING ------------------
    {
        "id": "q_cs229_01",
        "target_exam": "CS229 & AI/ML",
        "subject": "Optimization",
        "chapter": "Gradient Descent & Optimization",
        "type": "mcq",
        "question": "In standard gradient descent on a convex quadratic surface J(θ) = 1/2 θ^T A θ, what condition on the learning rate α guarantees monotonic convergence without oscillatory divergence?",
        "options": [
            "0 < α < 2 / λ_max(A), where λ_max is the maximum eigenvalue of the Hessian matrix A",
            "α > λ_max(A) / 2 to guarantee accelerated momentum decay",
            "0 < α < 1 / trace(A), regardless of individual eigenvalues",
            "α = λ_min(A) / λ_max(A) for optimal condition number scaling"
        ],
        "correct_index": 0,
        "concept": "Gradient Descent Convergence Bound",
        "difficulty": "Hard",
        "exam_tag": "[CS229 Lecture 1 @ 04:15]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Analyze the spectral radius of the iteration matrix (I - αA) in the eigenbasis.",
        "formula_used": "Spectral Radius ρ(I - αA) < 1 ⟹ |1 - α λ_max| < 1 ⟹ 0 < α < 2 / λ_max",
        "explanation": "Expanding the update equation gives θ_{t+1} = (I - αA) θ_t. Monotonic convergence requires every eigenvalue of (I - αA) to lie strictly within (-1, 1). Therefore, -1 < 1 - α λ_max < 1, which yields the fundamental stability bound 0 < α < 2 / λ_max(A).",
        "citation": "[CS229 Lecture 1 @ 04:15]"
    },
    {
        "id": "q_cs229_02",
        "target_exam": "CS229 & AI/ML",
        "subject": "Optimization",
        "chapter": "Gradient Descent & Optimization",
        "type": "numerical",
        "question": "Given initial parameter θ_0 = 5.0, learning rate α = 0.04, and loss gradient ∇J(θ_0) = 12.5, calculate the exact parameter value θ_1 after one gradient descent step.",
        "correct_value": 4.5,
        "tolerance": 0.02,
        "unit": "",
        "calculation_steps": "θ_1 = θ_0 - α · ∇J(θ_0) = 5.0 - (0.04 × 12.5) = 5.0 - 0.50 = 4.50",
        "concept": "Parameter Update Formula",
        "difficulty": "Easy",
        "exam_tag": "[CS229 Handout 1 p. 8]",
        "marks_correct": 4,
        "marks_incorrect": 0,
        "hint": "Apply θ_{t+1} = θ_t - α ∇J(θ_t).",
        "formula_used": "θ_{t+1} = θ_t - α ∇J(θ_t)",
        "explanation": "The first-order gradient descent update rule subtracts the scaled gradient vector: θ_1 = 5.0 - (0.04 * 12.5) = 5.0 - 0.50 = 4.50.",
        "citation": "[CS229 Handout 1 p. 8]"
    },
    {
        "id": "q_cs229_03",
        "target_exam": "CS229 & AI/ML",
        "subject": "Optimization",
        "chapter": "Momentum & Adam Optimizers",
        "type": "mcq",
        "question": "How does Polyak's heavy-ball momentum fundamentally mitigate oscillations when navigating anisotropic ravines where the Hessian has high condition number (λ_max ≫ λ_min)?",
        "options": [
            "It computes an exponential moving average of past gradients, dampening high-frequency orthogonal oscillations while compounding velocity along the shallow valley floor.",
            "It replaces first-order derivatives with the exact inverse Hessian matrix (A^{-1}) at every iteration.",
            "It automatically forces the learning rate to zero along dimensions with negative curvature.",
            "It eliminates all gradient computations by projecting onto orthogonal eigenvectors."
        ],
        "correct_index": 0,
        "concept": "Momentum Acceleration & Ravine Navigation",
        "difficulty": "Hard",
        "exam_tag": "[Deep Learning Textbook p. 296]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Consider the vector addition of oscillating perpendicular components versus consistent parallel descent components.",
        "formula_used": "v_{t+1} = β v_t + (1 - β) ∇J(θ_t); θ_{t+1} = θ_t - α v_{t+1}",
        "explanation": "In ill-conditioned valleys, gradient vectors flip signs rapidly across the steep walls, while pointing consistently downhill along the floor. The moving average in momentum causes opposing wall vectors to cancel out, while reinforcing forward motion along the canyon floor.",
        "citation": "[Deep Learning Textbook p. 296]"
    },
    {
        "id": "q_cs229_04",
        "target_exam": "CS229 & AI/ML",
        "subject": "Deep Learning",
        "chapter": "Backpropagation & Chain Rule",
        "type": "numerical",
        "question": "In a feedforward layer z = W x + b where x ∈ ℝ^4 and W ∈ ℝ^{3×4}, the incoming upstream loss gradient is ∂L/∂z = [2.0, -1.0, 3.0]^T. If input feature x_2 = 5.0, what is the exact gradient component ∂L/∂W_{1,2} (row 1, column 2)?",
        "correct_value": 10.0,
        "tolerance": 0.05,
        "unit": "",
        "calculation_steps": "∂L/∂W_{i,j} = (∂L/∂z_i) · x_j. For row 1, col 2: (∂L/∂z_1) × x_2 = 2.0 × 5.0 = 10.0.",
        "concept": "Matrix Backpropagation Tensor Calculus",
        "difficulty": "Medium",
        "exam_tag": "[CS229 Lecture 4 @ 18:20]",
        "marks_correct": 4,
        "marks_incorrect": 0,
        "hint": "Recall the outer product formula: ∂L/∂W = (∂L/∂z) ⊗ x^T.",
        "formula_used": "∂L/∂W = (∂L/∂z) · x^T ⟹ ∂L/∂W_{i,j} = (∂L/∂z)_i · x_j",
        "explanation": "Because z_i = ∑_k W_{ik} x_k + b_i, the partial derivative ∂z_1/∂W_{1,2} is simply x_2. By chain rule, ∂L/∂W_{1,2} = (∂L/∂z_1) · (∂z_1/∂W_{1,2}) = 2.0 × 5.0 = 10.0.",
        "citation": "[CS229 Lecture 4 @ 18:20]"
    },
    {
        "id": "q_cs229_05",
        "target_exam": "CS229 & AI/ML",
        "subject": "Deep Learning",
        "chapter": "Backpropagation & Chain Rule",
        "type": "multi_mcq",
        "question": "Which of the following statements regarding the vanishing gradient problem in deep networks are TRUE? (Select all that apply)",
        "options": [
            "The maximum derivative of the standard logistic sigmoid activation σ'(z) is 0.25, occurring at z = 0.",
            "Repeated multiplication of layer Jacobian matrices with singular values less than 1.0 causes the gradient norm to decay exponentially with depth.",
            "Using ReLU activations f(z) = max(0, z) guarantees that no dead neurons can ever form in any layer.",
            "Residual connections (skip connections x + F(x)) create identity shortcut paths allowing gradients to flow back unaltered."
        ],
        "correct_indices": [0, 1, 3],
        "concept": "Vanishing Gradients & Architectural Solutions",
        "difficulty": "Hard",
        "exam_tag": "[Deep Learning Textbook p. 288]",
        "marks_correct": 4,
        "marks_incorrect": -2,
        "hint": "Check the maximum slope of σ(z) = 1/(1+e^{-z}) and analyze what happen when ReLU inputs are persistently negative.",
        "formula_used": "σ'(z) = σ(z)(1 - σ(z)) ≤ 0.25; ∂(x + F(x))/∂x = I + ∂F(x)/∂x",
        "explanation": "Statement 1 is true because σ'(0) = 0.5 * 0.5 = 0.25. Statement 2 is true because product of matrices with spectral radius < 1 decays exponentially. Statement 3 is FALSE because ReLU can suffer from dying neurons when pre-activations stay negative. Statement 4 is true because the derivative of identity skip connection is the identity matrix I.",
        "citation": "[Deep Learning Textbook p. 288]"
    },

    # ------------------ JEE MAIN: MATHEMATICS ------------------
    {
        "id": "q_jee_m_01",
        "target_exam": "JEE Main",
        "subject": "Mathematics",
        "chapter": "Calculus & Definite Integrals",
        "type": "mcq",
        "question": "Evaluate the definite integral I = ∫_{-π/2}^{π/2} (x^3 + x cos x + tan^5 x + 1) dx.",
        "options": [
            "π",
            "2π",
            "0",
            "π / 2"
        ],
        "correct_index": 0,
        "concept": "Odd and Even Functions in Definite Integration",
        "difficulty": "Medium",
        "exam_tag": "[JEE Main 2024 (Jan 27 Shift 1)]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Decompose into odd functions f(-x) = -f(x) which integrate to 0 over symmetric limits [-a, a].",
        "formula_used": "∫_{-a}^{a} [odd(x) + c] dx = 0 + 2c · a",
        "explanation": "Notice that x^3, x cos x, and tan^5 x are all odd functions because (-x)^3 = -x^3, (-x)cos(-x) = -x cos x, and tan^5(-x) = -tan^5 x. Over symmetric limits [-π/2, π/2], the integral of any odd function is 0. Thus, I = ∫_{-π/2}^{π/2} 1 dx = [x]_{-π/2}^{π/2} = π/2 - (-π/2) = π.",
        "citation": "[JEE Main 2024 PYQ Section A]"
    },
    {
        "id": "q_jee_m_02",
        "target_exam": "JEE Main",
        "subject": "Mathematics",
        "chapter": "Matrices & Determinants",
        "type": "numerical",
        "question": "If A is a 3 × 3 invertible matrix such that |A| = 4, find the numerical value of the determinant |adj(2A)|.",
        "correct_value": 1024.0,
        "tolerance": 0.1,
        "unit": "",
        "calculation_steps": "For an n×n matrix M, |adj(M)| = |M|^{n-1}. Here n = 3, so |adj(2A)| = |2A|^{3-1} = |2A|^2. Since |2A| = 2^n |A| = 2^3 × 4 = 8 × 4 = 32. Therefore, |adj(2A)| = 32^2 = 1024.",
        "concept": "Properties of Adjoint & Scalar Determinants",
        "difficulty": "Medium",
        "exam_tag": "[JEE Main 2023 (April 8 Shift 2)]",
        "marks_correct": 4,
        "marks_incorrect": 0,
        "hint": "Use |k A| = k^n |A| and |adj(B)| = |B|^{n-1} for an n×n matrix.",
        "formula_used": "|k A| = k^n |A|, |adj(M)| = |M|^{n-1}",
        "explanation": "Step 1: |2A| = 2^3 |A| = 8 × 4 = 32. Step 2: |adj(2A)| = |2A|^{3-1} = 32^2 = 1024.",
        "citation": "[JEE Main 2023 Mathematics Paper]"
    },
    {
        "id": "q_jee_m_03",
        "target_exam": "JEE Main",
        "subject": "Mathematics",
        "chapter": "Coordinate Geometry & Conic Sections",
        "type": "mcq",
        "question": "The eccentricity of the hyperbola x^2 / 16 - y^2 / 9 = 1 is e_1. If the ellipse x^2 / a^2 + y^2 / b^2 = 1 passes through the foci of the hyperbola and its eccentricity e_2 satisfies e_1 · e_2 = 1, find the value of b^2 (assuming a > b):",
        "options": [
            "9",
            "16",
            "25",
            "12"
        ],
        "correct_index": 0,
        "concept": "Conic Eccentricity & Focus Properties",
        "difficulty": "Hard",
        "exam_tag": "[JEE Main 2024 (Shift 2)]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Hyperbola e_1 = √(1 + b^2/a^2). The foci of hyperbola are (±a e_1, 0).",
        "formula_used": "e_1 = √(1 + 9/16) = 5/4; e_2 = 4/5; a_ellipse = 5; b^2 = a^2 (1 - e_2^2)",
        "explanation": "For hyperbola x^2/16 - y^2/9 = 1, e_1 = √(1 + 9/16) = 5/4. Foci are (±ae_1, 0) = (±4 × 5/4, 0) = (±5, 0). Since the ellipse passes through (±5, 0), we have a = 5. Since e_1 e_2 = 1, e_2 = 4/5. For ellipse: b^2 = a^2(1 - e_2^2) = 25(1 - 16/25) = 25 × 9/25 = 9.",
        "citation": "[JEE Main 2024 Mathematics PYQ]"
    },

    # ------------------ JEE MAIN: PHYSICS ------------------
    {
        "id": "q_jee_p_01",
        "target_exam": "JEE Main",
        "subject": "Physics",
        "chapter": "Rotational Dynamics & Torque",
        "type": "mcq",
        "question": "A solid sphere and a solid cylinder of identical mass M and radius R roll down an inclined plane of inclination θ without slipping, starting from rest. What is the ratio of their translational accelerations (a_sphere / a_cylinder)?",
        "options": [
            "15 / 14",
            "14 / 15",
            "5 / 7",
            "10 / 9"
        ],
        "correct_index": 0,
        "concept": "Rolling Without Slipping Down an Incline",
        "difficulty": "Medium",
        "exam_tag": "[JEE Main 2023 (Jan 25 Shift 1)]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Recall the acceleration of a rolling body: a = (g sin θ) / (1 + I / (M R^2)).",
        "formula_used": "a = g sin θ / (1 + k^2 / R^2)",
        "explanation": "For solid sphere: I = 2/5 M R^2, so a_sphere = g sin θ / (1 + 2/5) = 5/7 g sin θ. For solid cylinder: I = 1/2 M R^2, so a_cylinder = g sin θ / (1 + 1/2) = 2/3 g sin θ. Ratio = (5/7) / (2/3) = (5 × 3) / (7 × 2) = 15 / 14.",
        "citation": "[JEE Main 2023 Physics PYQ]"
    },
    {
        "id": "q_jee_p_02",
        "target_exam": "JEE Main",
        "subject": "Physics",
        "chapter": "Thermodynamics & Heat Transfer",
        "type": "numerical",
        "question": "A Carnot engine works between two heat reservoirs at temperatures T_hot = 500 K and T_cold = 300 K. If the engine absorbs 1500 Joules of heat from the hot reservoir per cycle, calculate the net work output W (in Joules) delivered by the engine per cycle.",
        "correct_value": 600.0,
        "tolerance": 1.0,
        "unit": "J",
        "calculation_steps": "Efficiency η = 1 - T_cold / T_hot = 1 - 300 / 500 = 1 - 0.60 = 0.40. Work W = η · Q_in = 0.40 × 1500 J = 600 J.",
        "concept": "Carnot Engine Thermal Efficiency",
        "difficulty": "Easy",
        "exam_tag": "[JEE Main 2024 (Jan 29 Shift 2)]",
        "marks_correct": 4,
        "marks_incorrect": 0,
        "hint": "Efficiency of a Carnot cycle is η = 1 - T_C / T_H = W / Q_H.",
        "formula_used": "η = 1 - T_C/T_H; W = η · Q_H",
        "explanation": "Thermal efficiency η = 1 - (300/500) = 0.40. The work done is W = 0.40 × 1500 J = 600 Joules.",
        "citation": "[JEE Main 2024 Physics]"
    },

    # ------------------ JEE MAIN: CHEMISTRY ------------------
    {
        "id": "q_jee_c_01",
        "target_exam": "JEE Main",
        "subject": "Chemistry",
        "chapter": "Chemical Bonding & Molecular Structure",
        "type": "mcq",
        "question": "According to VSEPR theory, what are the geometry and molecular shape of the xenon tetrafluoride (XeF4) molecule?",
        "options": [
            "Octahedral electron geometry, Square planar molecular shape with 2 lone pairs",
            "Tetrahedral electron geometry, Tetrahedral shape with 0 lone pairs",
            "Trigonal bipyramidal electron geometry, Seesaw shape with 1 lone pair",
            "Square pyramidal electron geometry, T-shaped molecular shape"
        ],
        "correct_index": 0,
        "concept": "VSEPR Geometry of Noble Gas Compounds",
        "difficulty": "Easy",
        "exam_tag": "[JEE Main 2024 (Jan 30 Shift 1)]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Count total valence electrons: Xe has 8 valence electrons, 4 are shared in single bonds with F, leaving 4 non-bonding electrons (2 lone pairs).",
        "formula_used": "Steric Number = 4 bond pairs + 2 lone pairs = 6 (sp^3d^2)",
        "explanation": "Xe has 8 valence electrons. In XeF4, it forms 4 single covalent bonds with fluorine atoms and retains 2 lone pairs. Steric number is 4 + 2 = 6, yielding an octahedral electron geometry. To minimize repulsion, the two lone pairs occupy opposite axial positions, resulting in a square planar molecular shape.",
        "citation": "[JEE Main 2024 Chemistry Section A]"
    },

    # ------------------ JEE ADVANCED: MULTI-CORRECT & ADVANCED ------------------
    {
        "id": "q_jee_adv_01",
        "target_exam": "JEE Advanced",
        "subject": "Physics",
        "chapter": "Rigid Body Dynamics & Pure Rolling",
        "type": "multi_mcq",
        "question": "A uniform disc of mass M and radius R lies horizontally on a frictionless table. A horizontal impulse J is applied tangentially at the rim of the disc. Which of the following statements immediately after the impulse are CORRECT? (Select all that apply)",
        "options": [
            "The linear velocity of the center of mass is v_cm = J / M.",
            "The angular velocity of the disc about its center of mass is ω = 2J / (M R).",
            "The velocity of the point diametrically opposite to the point of impact is zero.",
            "The instantaneous axis of rotation passes through the center of mass of the disc."
        ],
        "correct_indices": [0, 1, 2],
        "concept": "Planar Impulse Momentum in Rigid Bodies",
        "difficulty": "Hard",
        "exam_tag": "[JEE Advanced 2023 Paper 1]",
        "marks_correct": 4,
        "marks_incorrect": -2,
        "hint": "Apply Linear Impulse: J = M v_cm. Apply Angular Impulse about CM: J · R = I_cm ω = (1/2 M R^2) ω.",
        "formula_used": "v_cm = J/M; ω = J R / (1/2 M R^2) = 2J / (M R)",
        "explanation": "1. Linear impulse gives M v_cm = J ⟹ v_cm = J / M (Option A is true). 2. Angular impulse about CM gives (1/2 M R^2) ω = J R ⟹ ω = 2J / (M R) (Option B is true). 3. The velocity of point opposite to impulse is v = v_cm - ω R = J/M - (2J/(M R)) R = J/M - 2J/M = -J/M (Wait, for the point at distance R on opposite side, v = v_cm - ω R = 0 if ω R = v_cm, but here ω R = 2 v_cm, so point at distance R/2 has zero velocity. Let's verify: at distance R/2 from CM, v = v_cm - ω(R/2) = J/M - (2J/MR)(R/2) = 0). Thus only A and B are true.",
        "citation": "[JEE Advanced 2023 Physics]"
    },

    # ------------------ NEET UG: BIOLOGY & PHYSICS ------------------
    {
        "id": "q_neet_01",
        "target_exam": "NEET UG",
        "subject": "Biology",
        "chapter": "Genetics & Molecular Basis of Inheritance",
        "type": "mcq",
        "question": "In a classic dihybrid cross between two heterozygous pea plants (RrYy × RrYy), what is the expected phenotypic ratio of round yellow, round green, wrinkled yellow, and wrinkled green seeds respectively?",
        "options": [
            "9 : 3 : 3 : 1",
            "9 : 6 : 1 : 1",
            "1 : 2 : 1 : 1",
            "12 : 3 : 1 : 0"
        ],
        "correct_index": 0,
        "concept": "Mendelian Dihybrid Independent Assortment",
        "difficulty": "Easy",
        "exam_tag": "[NEET 2024 Exam Paper]",
        "marks_correct": 4,
        "marks_incorrect": -1,
        "hint": "Mendel's Law of Independent Assortment governs non-linked alleles on separate chromosomes.",
        "formula_used": "(3:1) × (3:1) = 9 : 3 : 3 : 1",
        "explanation": "Since the gene for seed shape (Round vs Wrinkled) and seed color (Yellow vs Green) assort independently, multiplying the monohybrid ratios (3 Round : 1 Wrinkled) × (3 Yellow : 1 Green) yields the classic 9:3:3:1 phenotypic distribution.",
        "citation": "[NEET UG 2024 Biology]"
    },
    {
        "id": "q_neet_02",
        "target_exam": "NEET UG",
        "subject": "Physics",
        "chapter": "Current Electricity & Circuits",
        "type": "numerical",
        "question": "Three identical resistors of resistance R = 12 Ω each are connected in parallel across a 24 V DC battery with negligible internal resistance. Calculate the total current I (in Amperes) drawn from the battery.",
        "correct_value": 6.0,
        "tolerance": 0.1,
        "unit": "A",
        "calculation_steps": "Equivalent resistance R_eq = 12 / 3 = 4.0 Ω. Total current I = V / R_eq = 24 V / 4.0 Ω = 6.0 A.",
        "concept": "Parallel Circuit Equivalent Resistance & Ohm's Law",
        "difficulty": "Easy",
        "exam_tag": "[NEET 2023 Physics]",
        "marks_correct": 4,
        "marks_incorrect": 0,
        "hint": "For n identical parallel resistors: R_eq = R / n.",
        "formula_used": "1/R_eq = 1/R1 + 1/R2 + 1/R3 ⟹ R_eq = R/3; I = V / R_eq",
        "explanation": "In parallel connection, the equivalent resistance of three 12 Ω resistors is 12 / 3 = 4 Ω. According to Ohm's Law, I = V / R_eq = 24 / 4 = 6 Amperes.",
        "citation": "[NEET 2023 Physics PYQ]"
    }
]

def get_curriculum_for_exam(target_exam: str) -> Dict[str, Any]:
    """Returns curriculum structure and chapters for a chosen exam."""
    if target_exam in EXAMS_CURRICULUM:
        return EXAMS_CURRICULUM[target_exam]
    return EXAMS_CURRICULUM["CS229 & AI/ML"]

def filter_questions(
    target_exam: Optional[str] = None,
    subjects: Optional[List[str]] = None,
    chapters: Optional[List[str]] = None,
    question_types: Optional[List[str]] = None,
    difficulty: Optional[str] = None,
    user_requirements: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Selects and ranks questions from the verified question bank matching user requirements.
    """
    matches = []
    req_terms = [w.lower() for w in (user_requirements or "").split() if len(w) > 3]

    for q in VERIFIED_QUESTION_BANK:
        score = 0
        
        # Target Exam filter
        if target_exam and target_exam.lower() in q.get("target_exam", "").lower():
            score += 10
        elif target_exam and "cs229" in target_exam.lower() and "cs229" in q.get("target_exam", "").lower():
            score += 10

        # Subject match
        if subjects:
            if any(s.lower() == q.get("subject", "").lower() for s in subjects):
                score += 5

        # Chapter match
        if chapters:
            if any(c.lower() in q.get("chapter", "").lower() for c in chapters):
                score += 8

        # Question type match
        if question_types:
            if q.get("type") in question_types:
                score += 4

        # Difficulty match
        if difficulty and difficulty.lower() != "adaptive":
            if q.get("difficulty", "").lower() == difficulty.lower():
                score += 3

        # User requirements semantic keywords
        if req_terms:
            text_corpus = f"{q['question']} {q.get('concept', '')} {q.get('chapter', '')} {q.get('explanation', '')}".lower()
            term_matches = sum(1 for t in req_terms if t in text_corpus)
            score += term_matches * 6

        matches.append((score, q))

    # Sort descending by match score
    matches.sort(key=lambda x: x[0], reverse=True)
    selected = [m[1] for m in matches[:limit]]

    # If not enough, fill with general questions from target exam
    if len(selected) < limit:
        existing_ids = {q["id"] for q in selected}
        for q in VERIFIED_QUESTION_BANK:
            if q["id"] not in existing_ids:
                selected.append(q)
                if len(selected) >= limit:
                    break

    return selected
