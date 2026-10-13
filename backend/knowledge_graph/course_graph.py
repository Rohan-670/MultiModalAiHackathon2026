"""
Course Knowledge Graph & Prerequisite Flow Map:
- Organizes curriculum into Topics, Subtopics, Concepts, and Prerequisites DAG.
- Links every node to verified origin (page, slide, video timestamp).
- Catalogs figures, formulas, and diagrams for multimodal source review.
"""

from typing import Dict, List, Any, Optional

COURSE_NODES = [
    {
        "id": "node_loss_function",
        "topic": "Optimization Fundamentals",
        "concept": "Empirical Risk & Loss Function J(θ)",
        "prerequisites": [],
        "difficulty": "beginner",
        "citations": ["[CS229 Lecture 1 @ 00:45]"],
        "origin_type": "video",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "timestamp_str": "00:45",
        "page": None,
        "description": "Formulating supervised learning as minimizing an empirical loss surface over dataset examples.",
        "diagram": {
            "title": "Loss Surface Convex Bowl",
            "type": "svg_landscape",
            "caption": "Convex quadratic loss surface J(θ) with global minimum θ* at origin."
        }
    },
    {
        "id": "node_gradient_step",
        "topic": "Optimization Fundamentals",
        "concept": "Negative Gradient Update Rule",
        "prerequisites": ["node_loss_function"],
        "difficulty": "beginner",
        "citations": ["[CS229 Lecture 1 @ 01:30]", "[Deep Learning Textbook p. 14]"],
        "origin_type": "video",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "timestamp_str": "01:30",
        "page": 14,
        "description": "Stepping opposite to the gradient vector: θ := θ - α ∇J(θ) to descend the loss curve.",
        "diagram": {
            "title": "Steepest Descent Vector ∇J",
            "type": "svg_vector",
            "caption": "Gradient vector points in greatest rate of increase; negative step moves toward minimum."
        }
    },
    {
        "id": "node_learning_rate",
        "topic": "Optimization Fundamentals",
        "concept": "Learning Rate Tuning & Divergence",
        "prerequisites": ["node_gradient_step"],
        "difficulty": "intermediate",
        "citations": ["[CS229 Lecture 1 @ 02:45]", "[CS229 Lecture 1 @ 04:15]", "[Deep Learning Textbook p. 14]"],
        "origin_type": "video",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "timestamp_str": "04:15",
        "page": 14,
        "description": "Analyzing step size α: undershooting causes slow convergence; overshooting causes catastrophic divergence.",
        "diagram": {
            "title": "Oscillatory Ravine Trajectory",
            "type": "svg_divergence",
            "caption": "Trajectory bouncing across steep ravine walls when step size α exceeds stability limit."
        }
    },
    {
        "id": "node_backpropagation",
        "topic": "Neural Network Fundamentals",
        "concept": "Backpropagation & Multivariate Chain Rule",
        "prerequisites": ["node_gradient_step"],
        "difficulty": "intermediate",
        "citations": ["[Deep Learning Textbook p. 28]"],
        "origin_type": "pdf",
        "source_name": "Deep Learning Textbook (Goodfellow)",
        "timestamp_str": None,
        "page": 28,
        "description": "Applying calculus chain rule backwards from loss to internal weight tensors ∂L/∂W and biases.",
        "diagram": {
            "title": "Computational Graph Reverse Flow",
            "type": "svg_comp_graph",
            "caption": "Forward activations propagate rightward; adjoint error gradients ∂L/∂h propagate leftward."
        }
    },
    {
        "id": "node_sgd_minibatch",
        "topic": "Large-Scale Optimization",
        "concept": "Mini-Batch Stochastic Gradient Descent (SGD)",
        "prerequisites": ["node_learning_rate"],
        "difficulty": "intermediate",
        "citations": ["[Deep Learning Textbook p. 45]"],
        "origin_type": "pdf",
        "source_name": "Deep Learning Textbook (Goodfellow)",
        "timestamp_str": None,
        "page": 45,
        "description": "Computing unbiased Monte Carlo estimates of the loss gradient using mini-batches of size m (32-256).",
        "diagram": {
            "title": "Mini-batch Noisy Trajectory",
            "type": "svg_stochastic",
            "caption": "Noisy gradient estimates introduce exploration fluctuations preventing early entrapment in shallow minima."
        }
    },
    {
        "id": "node_loss_landscape",
        "topic": "Optimization Landscapes",
        "concept": "Non-Convex Surfaces, Saddle Points & Ravines",
        "prerequisites": ["node_gradient_step"],
        "difficulty": "intermediate",
        "citations": ["[Week 3 Slides Slide 2]"],
        "origin_type": "slides",
        "source_name": "Week 3 Slides - Neural Optimization",
        "timestamp_str": None,
        "page": 2,
        "description": "High-dimensional loss surfaces dominated by saddle points with ill-conditioned Hessian eigenvalues.",
        "diagram": {
            "title": "Saddle Point with Negative Curvature",
            "type": "svg_saddle",
            "caption": "Saddle point with zero gradient but negative curvature allowing escape along eigenvector direction."
        }
    },
    {
        "id": "node_momentum",
        "topic": "Accelerated Optimizers",
        "concept": "Polyak & Nesterov Momentum Acceleration",
        "prerequisites": ["node_loss_landscape", "node_learning_rate"],
        "difficulty": "intermediate",
        "citations": ["[CS229 Lecture 1 @ 05:50]"],
        "origin_type": "video",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "timestamp_str": "05:50",
        "page": None,
        "description": "Exponential moving average of past gradients: vt := β vt-1 + (1-β) ∇J, dampening oscillations.",
        "diagram": {
            "title": "Momentum Velocity Accumulator",
            "type": "svg_momentum",
            "caption": "Dampened lateral oscillations along ravine walls while accelerating down the valley floor."
        }
    },
    {
        "id": "node_adam",
        "topic": "Accelerated Optimizers",
        "concept": "Adam (Adaptive Moment Estimation)",
        "prerequisites": ["node_momentum", "node_sgd_minibatch"],
        "difficulty": "advanced",
        "citations": ["[Week 3 Slides Slide 5]"],
        "origin_type": "slides",
        "source_name": "Week 3 Slides - Neural Optimization",
        "timestamp_str": None,
        "page": 5,
        "description": "Combining first-moment momentum and second-moment RMSProp variance scaling with bias correction.",
        "diagram": {
            "title": "Adaptive Coordinate Scaling",
            "type": "svg_adam",
            "caption": "Per-parameter adaptive step scaling dividing by square root of second moment v_t."
        }
    }
]

class CourseFlowManager:
    """Manages course flow graph, prerequisite resolution, and diagram catalog."""

    def __init__(self, nodes: Optional[List[Dict[str, Any]]] = None):
        self.nodes = nodes or COURSE_NODES

    def get_flow_graph(self, learner_model_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Builds DAG for visual rendering with learner mastery state overlaid on each node.
        """
        # Map concept -> mastery from learner model if available
        mastery_map = {}
        if learner_model_profile and "concepts" in learner_model_profile:
            for c in learner_model_profile["concepts"]:
                mastery_map[c["concept"].lower()] = c["mastery_probability"]

        nodes_data = []
        for n in self.nodes:
            # Check mastery by concept match
            concept_key = n["concept"].lower()
            # fuzzy check
            mastery_score = 0.20 # default prior
            for k, score in mastery_map.items():
                if k in concept_key or concept_key in k:
                    mastery_score = score
                    break

            if mastery_score >= 0.75:
                status = "Mastered"
                color = "#10b981" # green
            elif mastery_score >= 0.40:
                status = "In Progress"
                color = "#f59e0b" # amber
            else:
                status = "Needs Review"
                color = "#ef4444" # red

            nodes_data.append({
                **n,
                "mastery_score": round(mastery_score, 3),
                "mastery_status": status,
                "status_color": color
            })

        # Edges
        edges = []
        for n in self.nodes:
            for prereq_id in n.get("prerequisites", []):
                edges.append({
                    "from": prereq_id,
                    "to": n["id"],
                    "label": "Prerequisite"
                })

        return {
            "nodes": nodes_data,
            "edges": edges,
            "total_nodes": len(nodes_data),
            "topics": list(set(n["topic"] for n in self.nodes))
        }

    def get_diagrams(self) -> List[Dict[str, Any]]:
        """Returns catalog of extracted figures and diagrams."""
        return [
            {
                "concept": n["concept"],
                "citation": n["citations"][0] if n["citations"] else "Course Material",
                "origin": f"{n['source_name']} (Page {n.get('page')})" if n.get('page') else f"{n['source_name']} (@ {n.get('timestamp_str')})",
                **n["diagram"]
            }
            for n in self.nodes if n.get("diagram")
        ]
