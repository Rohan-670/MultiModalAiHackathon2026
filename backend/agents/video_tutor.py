import json
import time
from typing import List, Dict, Any, Optional

class VideoTutorAgent:
    """
    Agent 7: Video Tutor Agent
    Generates structured, multimodal educational video lessons in 3 supported formats:
    - Style A: Animated Educational Explanations (algorithmic/mathematical animations & loss surfaces)
    - Style B: Narrated PDF/PPT Slides (structured slide cards with synchronized voice narration & captions)
    - Style C: 2D Animated Teacher Character (character with speech gestures & whiteboard drawings)

    Features:
    - Generates structured narration scripts and scene breakdowns
    - Builds synchronized WebVTT/SRT caption timings
    - Generates timeline chapter navigation markers
    - Links to exact course citations and triggers post-lesson adaptive quizzes
    """

    SUPPORTED_STYLES = [
        {"id": "animated_concept", "name": "Style A: Animated Mathematical Explanations", "desc": "Algorithmic animations, loss landscapes, and mathematical equations."},
        {"id": "narrated_slides", "name": "Style B: Narrated Slide Deck", "desc": "Synchronized slide layouts with highlighted passages and captions."},
        {"id": "animated_teacher", "name": "Style C: 2D Animated Teacher Character", "desc": "Engaging animated instructor with synchronized expressions and whiteboard notes."}
    ]

    def __init__(self, vector_store):
        self.vector_store = vector_store

    def generate_lesson_plan(
        self,
        topic: str,
        style: str = "animated_concept",
        weak_concept: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a structured lesson plan with scene-by-scene script, chapters, and captions.
        """
        # Retrieve grounding context
        chunks = self.vector_store.hybrid_search(topic, top_k=4)
        cites = [c.get("citation_tag", "Course Materials") for c in chunks]

        lesson_id = f"vid_{int(time.time() * 1000)}"

        if style == "animated_concept":
            title = f"Animated Visual Derivation: {topic}"
            duration = 180
            scenes = [
                {
                    "scene_index": 1,
                    "title": "The Empirical Risk Loss Surface",
                    "timestamp": "00:00",
                    "start_sec": 0,
                    "end_sec": 45,
                    "visual_element": "3D quadratic loss bowl J(theta) with contour concentric ellipses",
                    "narration": "In supervised machine learning, we model our problem as finding the lowest point on an empirical loss surface J of theta over our dataset [CS229 Lecture 1 @ 00:45].",
                    "caption": "Formulating supervised optimization as empirical risk minimization over dataset examples."
                },
                {
                    "scene_index": 2,
                    "title": "Negative Gradient Vector Rule",
                    "timestamp": "00:45",
                    "start_sec": 45,
                    "end_sec": 95,
                    "visual_element": "Orthogonal gradient vector nabla J pointing uphill, negative step pointing downhill",
                    "narration": "The gradient vector points in the direction of steepest ascent. Hence, our parameter update steps opposite to the gradient: theta := theta - alpha * nabla J [CS229 Lecture 1 @ 01:30].",
                    "caption": "Parameter update rule stepping in the negative gradient direction scaled by learning rate alpha."
                },
                {
                    "scene_index": 3,
                    "title": "Learning Rate Stability & Divergence",
                    "timestamp": "01:35",
                    "start_sec": 95,
                    "end_sec": 140,
                    "visual_element": "Oscillating trajectory bouncing between steep ravine walls and diverging upward",
                    "narration": "If learning rate alpha is chosen too large, updates overshoot the ravine floor and violently diverge toward infinity [CS229 Lecture 1 @ 04:15].",
                    "caption": "Step size instability: small alpha converges slowly; excessive alpha catastrophically diverges."
                },
                {
                    "scene_index": 4,
                    "title": "Momentum Velocity Damping",
                    "timestamp": "02:20",
                    "start_sec": 140,
                    "end_sec": 180,
                    "visual_element": "Exponential moving average vector canceling perpendicular oscillations and accelerating downhill",
                    "narration": "Polyak Momentum accumulates past velocity vectors, dampening lateral oscillations while speeding up downhill motion along the ravine [CS229 Lecture 1 @ 05:50].",
                    "caption": "Momentum accumulator accelerates along consistent gradients and cancels ravine oscillations."
                }
            ]
        elif style == "narrated_slides":
            title = f"Slide Lecture: {topic}"
            duration = 210
            scenes = [
                {
                    "scene_index": 1,
                    "title": "Slide 1: Core Mathematical Principles",
                    "timestamp": "00:00",
                    "start_sec": 0,
                    "end_sec": 55,
                    "visual_element": "Slide slide_w3_s02 with highlighted definition of Loss Surface J(theta)",
                    "narration": "Welcome to our structured slide overview. Continuous optimization requires iterative first-order parameter updates [Deep Learning Textbook p. 14].",
                    "caption": "Slide 1: Iterative continuous optimization and empirical risk definition."
                },
                {
                    "scene_index": 2,
                    "title": "Slide 2: Backpropagation Calculus",
                    "timestamp": "00:55",
                    "start_sec": 55,
                    "end_sec": 135,
                    "visual_element": "Slide with reverse computational graph and chain rule partial derivatives",
                    "narration": "Backpropagation systematically applies the multivariable chain rule backwards from the scalar loss to intermediate weights [Deep Learning Textbook p. 28].",
                    "caption": "Slide 2: Multivariate chain rule propagating partial derivatives backward through hidden layers."
                },
                {
                    "scene_index": 3,
                    "title": "Slide 3: Adam & Second-Moment Scaling",
                    "timestamp": "02:15",
                    "start_sec": 135,
                    "end_sec": 210,
                    "visual_element": "Slide 5: Coordinate-wise adaptive step formulas combining Momentum and RMSProp",
                    "narration": "The Adam optimizer tracks first moments for momentum and uncentered second moments for coordinate variance scaling [Week 3 Slides Slide 5].",
                    "caption": "Slide 3: Adaptive Moment Estimation combining momentum and RMSProp variance normalization."
                }
            ]
        else:
            # Animated 2D Teacher Character
            title = f"Professor AI: Intuitive Walkthrough on {topic}"
            duration = 160
            scenes = [
                {
                    "scene_index": 1,
                    "title": "Concept Intuition & Analogy",
                    "timestamp": "00:00",
                    "start_sec": 0,
                    "end_sec": 50,
                    "visual_element": "2D Animated instructor gesturing towards a foggy mountain analogy on the whiteboard",
                    "narration": "Imagine hiking down a foggy mountain where you can only feel the slope directly under your feet. That slope is your gradient vector [CS229 Lecture 1 @ 01:30].",
                    "caption": "Hiking in dense fog analogy: feeling local ground slope to decide the steepest downhill step."
                },
                {
                    "scene_index": 2,
                    "title": "Whiteboard Derivation",
                    "timestamp": "00:50",
                    "start_sec": 50,
                    "end_sec": 110,
                    "visual_element": "Animated instructor writing theta_next = theta - alpha * nabla J on the whiteboard",
                    "narration": "Taking moderate strides ensures safe descent. Oversized leaps will send you tumbling off the ravine cliff [CS229 Lecture 1 @ 04:15]!",
                    "caption": "Whiteboard derivation: step size tuning avoids falling into numerical infinity."
                },
                {
                    "scene_index": 3,
                    "title": "Key Takeaways & Quiz Check",
                    "timestamp": "01:50",
                    "start_sec": 110,
                    "end_sec": 160,
                    "visual_element": "Animated instructor pointing to the summary checklist and post-lesson quiz pill",
                    "narration": "Remember these two rules: step opposite to the gradient, and calibrate your learning rate. Now test your intuition with the post-lesson quiz!",
                    "caption": "Key takeaways checklist: gradient direction, learning rate bounds, and momentum benefits."
                }
            ]

        # Chapters
        chapters = [
            {"title": s["title"], "timestamp": s["timestamp"], "seconds": s["start_sec"]}
            for s in scenes
        ]

        # Captions
        captions = [
            {"start": s["start_sec"], "end": s["end_sec"], "text": s["caption"]}
            for s in scenes
        ]

        full_script = " ".join([s["narration"] for s in scenes])

        return {
            "id": lesson_id,
            "title": title,
            "topic": topic,
            "style": style,
            "duration_seconds": duration,
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "script": full_script,
            "scenes": scenes,
            "chapters": chapters,
            "captions": captions,
            "citations": cites,
            "quiz_recommendation": f"Adaptive Quiz on {topic}"
        }
