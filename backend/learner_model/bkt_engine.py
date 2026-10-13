import math
import time
from typing import Dict, List, Any, Optional

class BayesianKnowledgeTracer:
    """
    Standard Bayesian Knowledge Tracing (BKT) engine with Spaced Repetition decay.
    
    BKT Parameters:
    - P(L0): Initial probability of knowing the concept (prior)
    - P(T): Transition probability (learning from practice)
    - P(G): Guess probability (correct answer despite not knowing)
    - P(S): Slip probability (incorrect answer despite knowing)
    """

    DEFAULT_PARAMS = {
        "p_l0": 0.20,   # Initial prior
        "p_t": 0.15,    # Transit probability
        "p_g": 0.20,    # Guess probability
        "p_s": 0.10,    # Slip probability
    }

    # Half-life stability in hours for Ebbinghaus forgetting curve
    DEFAULT_STABILITY_HOURS = 48.0

    def __init__(self):
        # concept_id -> { "mastery": float, "history": list, "last_updated": float, "attempts": int, "correct": int }
        self.concept_states: Dict[str, Dict[str, Any]] = {}
        # Seen question fingerprints to ensure 0% duplicate questions across assessments
        self.seen_question_ids: set = set()
        # Intake diagnostic completed flag
        self.diagnostic_completed: bool = False
        self.student_name: str = "Learner"

    def get_or_create_concept(self, concept: str, initial_prior: Optional[float] = None) -> Dict[str, Any]:
        concept_clean = concept.strip()
        if concept_clean not in self.concept_states:
            prior = initial_prior if initial_prior is not None else self.DEFAULT_PARAMS["p_l0"]
            self.concept_states[concept_clean] = {
                "concept": concept_clean,
                "mastery": prior,
                "history": [],
                "last_updated": time.time(),
                "attempts": 0,
                "correct": 0,
                "stability_hours": self.DEFAULT_STABILITY_HOURS
            }
        return self.concept_states[concept_clean]

    def update_mastery(self, concept: str, is_correct: bool, difficulty: str = "intermediate") -> Dict[str, Any]:
        """
        Updates concept mastery probability using standard BKT formulas.
        Difficulty scales slip and guess probabilities.
        """
        state = self.get_or_create_concept(concept)
        p_l_prev = state["mastery"]
        params = dict(self.DEFAULT_PARAMS)

        # Adjust guess/slip by question difficulty
        if difficulty == "advanced":
            params["p_g"] = 0.15
            params["p_s"] = 0.15
        elif difficulty == "beginner":
            params["p_g"] = 0.25
            params["p_s"] = 0.08

        p_g = params["p_g"]
        p_s = params["p_s"]
        p_t = params["p_t"]

        # 1. Posterior calculation P(L_{t-1} | Obs)
        if is_correct:
            numerator = p_l_prev * (1.0 - p_s)
            denominator = numerator + ((1.0 - p_l_prev) * p_g)
        else:
            numerator = p_l_prev * p_s
            denominator = numerator + ((1.0 - p_l_prev) * (1.0 - p_g))

        denominator = max(denominator, 1e-9)
        p_l_posterior = numerator / denominator

        # 2. Transit update P(L_t) = P(L_{t-1} | Obs) + (1 - P(L_{t-1} | Obs)) * P(T)
        # If wrong, transit is lower (scaffolding required)
        transit = p_t if is_correct else (p_t * 0.5)
        p_l_new = p_l_posterior + ((1.0 - p_l_posterior) * transit)
        p_l_new = min(max(p_l_new, 0.02), 0.99) # Clip bounds

        # 3. Update stability (Spaced Repetition)
        if is_correct:
            state["stability_hours"] = min(state["stability_hours"] * 1.5, 336.0) # Up to 2 weeks
        else:
            state["stability_hours"] = max(state["stability_hours"] * 0.6, 12.0)

        # 4. Save state
        now = time.time()
        state["mastery"] = round(p_l_new, 4)
        state["last_updated"] = now
        state["attempts"] += 1
        if is_correct:
            state["correct"] += 1

        state["history"].append({
            "timestamp": now,
            "is_correct": is_correct,
            "mastery_after": round(p_l_new, 4),
            "difficulty": difficulty
        })

        return {
            "concept": concept,
            "prior_mastery": round(p_l_prev, 4),
            "new_mastery": round(p_l_new, 4),
            "delta": round(p_l_new - p_l_prev, 4),
            "status": "Mastered" if p_l_new >= 0.75 else ("Practicing" if p_l_new >= 0.40 else "Needs Review")
        }

    def update_from_conversation(self, concept: str, engagement_level: float = 0.5) -> Dict[str, Any]:
        """
        Updates mastery slightly when student discusses or asks questions about a concept in chat.
        """
        state = self.get_or_create_concept(concept)
        p_l_prev = state["mastery"]
        # Mild positive transit for study engagement (e.g. +0.03 to +0.06)
        transit_boost = 0.05 * min(max(engagement_level, 0.2), 1.0)
        p_l_new = min(p_l_prev + (1.0 - p_l_prev) * transit_boost, 0.95)
        
        state["mastery"] = round(p_l_new, 4)
        state["last_updated"] = time.time()
        return {
            "concept": concept,
            "prior_mastery": round(p_l_prev, 4),
            "new_mastery": round(p_l_new, 4)
        }

    def get_retrievability(self, concept: str) -> float:
        """
        Computes Ebbinghaus forgetting curve retrievability R(t) = exp(-delta_t / S).
        """
        if concept not in self.concept_states:
            return 0.0
        state = self.concept_states[concept]
        delta_hours = (time.time() - state["last_updated"]) / 3600.0
        stability = state.get("stability_hours", self.DEFAULT_STABILITY_HOURS)
        r = math.exp(-delta_hours / max(stability, 1.0))
        return round(r, 4)

    def apply_diagnostic_intake(self, answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calibrate new students with no history via intake diagnostic test.
        """
        results = []
        for item in answers:
            concept = item.get("concept", "General AI")
            is_correct = bool(item.get("is_correct", False))
            prior = 0.55 if is_correct else 0.15
            state = self.get_or_create_concept(concept, initial_prior=prior)
            state["mastery"] = prior
            results.append({
                "concept": concept,
                "initial_mastery": prior,
                "status": "Proficient" if is_correct else "Novice"
            })
        self.diagnostic_completed = True
        return {
            "message": "Diagnostic intake completed. Personalized priors calibrated.",
            "concepts_calibrated": results
        }

    def register_seen_question(self, question_text: str) -> bool:
        """
        Ensures questions are not repeated across assessments.
        Returns True if question is new; False if duplicate.
        """
        import hashlib
        q_hash = hashlib.md5(question_text.strip().lower().encode("utf-8")).hexdigest()
        if q_hash in self.seen_question_ids:
            return False
        self.seen_question_ids.add(q_hash)
        return True

    def get_full_profile(self) -> Dict[str, Any]:
        """
        Returns full learner model summary with BKT estimates and forgetting curves.
        """
        topics_summary = []
        total_mastery = 0.0
        weak_count = 0
        mastered_count = 0

        for concept, data in self.concept_states.items():
            mastery = data["mastery"]
            retrievability = self.get_retrievability(concept)
            total_mastery += mastery

            if mastery >= 0.75:
                status = "Mastered"
                mastered_count += 1
            elif mastery >= 0.40:
                status = "In Progress"
            else:
                status = "Knowledge Gap"
                weak_count += 1

            topics_summary.append({
                "concept": concept,
                "mastery_probability": round(mastery, 3),
                "mastery_percentage": round(mastery * 100, 1),
                "retrievability": round(retrievability * 100, 1),
                "status": status,
                "attempts": data["attempts"],
                "correct": data["correct"],
                "last_active": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data["last_updated"]))
            })

        avg_mastery = round(total_mastery / len(self.concept_states) * 100, 1) if self.concept_states else 0.0

        return {
            "student_name": self.student_name,
            "diagnostic_completed": self.diagnostic_completed,
            "average_mastery_pct": avg_mastery,
            "total_concepts_tracked": len(self.concept_states),
            "mastered_count": mastered_count,
            "knowledge_gap_count": weak_count,
            "concepts": sorted(topics_summary, key=lambda x: x["mastery_probability"], reverse=True),
            "total_unique_questions_served": len(self.seen_question_ids)
        }
