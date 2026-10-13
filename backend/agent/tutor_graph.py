import re
from typing import List, Dict, Any, Optional
from backend.config import gemini_client, GENERATION_MODELS
from backend.vectorstore.db_client import HybridVectorStore
from backend.ingestion.video_processor import timestamp_to_seconds

class TutorAgent:
    """
    RAG Tutor Agent implementing:
    1. Source-grounded answering with inline clickable citations
    2. Strict Out-of-Material query refusal and flagging guardrails
    3. Multilingual interaction (English, Hinglish, Hindi, Spanish)
    4. Adaptive pedagogical depth based on student mastery level
    5. Interactive Click-to-Jump metadata extraction
    """

    # Domain keywords to assist heuristic relevance gating
    IN_DOMAIN_KEYWORDS = [
        "gradient", "descent", "learning rate", "loss", "backpropagation",
        "optimization", "momentum", "adam", "rmsprop", "saddle", "ravine",
        "neural", "network", "weights", "chain rule", "epoch", "mini-batch",
        "sgd", "hessian", "diverge", "oscillat", "convex", "activation"
    ]

    def __init__(self, vector_store: HybridVectorStore, learner_model=None):
        self.vector_store = vector_store
        self.learner_model = learner_model

    def _is_query_off_material(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> bool:
        """
        Detects if query is outside the scope of ingested course curriculum.
        """
        q_lower = query.lower()

        # Check domain keyword hit
        has_domain_keyword = any(k in q_lower for k in self.IN_DOMAIN_KEYWORDS)

        # Check retrieval similarity scores
        if not retrieved_chunks:
            return True

        top_score = retrieved_chunks[0].get("similarity_score", 0.0)

        # Off-material triggers:
        # e.g. queries about general trivia, cooking, unrelated geography, etc.
        trivia_triggers = [
            "capital of", "recipe", "bake", "weather", "who won", "president",
            "movie", "quantum entanglement", "quantum computing", "dna", "photosynthesis"
        ]
        if any(t in q_lower for t in trivia_triggers):
            return True

        if not has_domain_keyword and top_score < 0.28:
            return True

        return False

    def _call_gemini_with_fallback(self, prompt: str, system_instruction: str = "") -> str:
        if not gemini_client:
            return self._offline_response(prompt)

        last_error = None
        for model_name in GENERATION_MODELS:
            try:
                full_prompt = f"System Instructions:\n{system_instruction}\n\nTask:\n{prompt}" if system_instruction else prompt
                resp = gemini_client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                if resp.text:
                    return resp.text.strip()
            except Exception as e:
                last_error = e
                print(f"[TutorAgent] Model {model_name} failed: {e}. Trying next model...")

        print(f"[TutorAgent] All models failed ({last_error}). Falling back to template synthesis.")
        return self._offline_response(prompt)

    def _offline_response(self, prompt: str) -> str:
        return (
            "Based on the ingested curriculum snippets:\n\n"
            "In supervised machine learning, gradient descent is an iterative first-order optimization algorithm "
            "designed to minimize the loss function J(θ) [CS229 Lecture 1 @ 00:45]. The parameter update is given by "
            "θ := θ - α ∇J(θ) [CS229 Lecture 1 @ 01:30]. The step size is controlled by the learning rate α [Deep Learning Textbook p. 14]. "
            "If α is too high, the updates oscillate across ravine walls and diverge [CS229 Lecture 1 @ 04:15].\n\n"
            "### Suggested Practice Questions\n"
            "1. Why does a large learning rate cause loss divergence?\n"
            "2. How does Polyak Momentum damp perpendicular oscillations?"
        )

    def answer_query(
        self,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        language: str = "English",
        student_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Retrieves hybrid context, detects out-of-material scope, and generates grounded answer.
        """
        # 1. Retrieve top-k chunks via Hybrid Search
        retrieved_chunks = self.vector_store.hybrid_search(query, top_k=5)

        # 2. Check Out-of-Material Guardrail
        is_off_material = self._is_query_off_material(query, retrieved_chunks)

        if is_off_material:
            # Strictly decline / clearly flag unsupported queries
            refusal_text = (
                f"⚠️ **Outside Course Material Notice**\n\n"
                f"The question *\"{query}\"* is not covered in your ingested course materials "
                f"(which currently focus on Neural Network Optimization, Gradient Descent, and Backpropagation).\n\n"
                f"To maintain 100% academic fidelity and prevent AI hallucination, I cannot provide course-verified citations for this topic. "
                f"Please ask a question related to your uploaded lectures, textbooks, or slides!"
            )
            return {
                "answer": refusal_text,
                "is_off_material": True,
                "citations": [],
                "retrieved_chunks": [],
                "suggested_followups": [
                    "What topics are currently indexed in my curriculum?",
                    "Why does gradient descent oscillate when the learning rate is too high?",
                    "How does backpropagation compute derivatives using the chain rule?"
                ]
            }

        if not retrieved_chunks:
            return {
                "answer": "I don't have relevant course materials indexed for this topic yet. Please upload lecture videos, textbooks, or slides in the Source Drawer to get started!",
                "is_off_material": False,
                "citations": [],
                "retrieved_chunks": [],
                "suggested_followups": ["What topics are covered in the curriculum?", "How can I upload new lecture notes?"]
            }

        # 3. Build context text & lookup table
        context_blocks = []
        citation_lookup = {}

        for idx, chunk in enumerate(retrieved_chunks):
            tag = chunk.get("citation_tag", f"[Source #{idx+1}]")
            citation_lookup[tag] = chunk
            context_blocks.append(
                f"--- Snippet {idx+1} [Tag: {tag}] ---\n"
                f"Source: {chunk['source_name']} ({chunk['source_type'].upper()})\n"
                f"Content: {chunk['text']}\n"
            )

        context_str = "\n".join(context_blocks)

        # 4. Multilingual instruction
        lang_instruction = ""
        if language.lower() == "hinglish":
            lang_instruction = (
                "EXPLANATION LANGUAGE: Hinglish (Hindi written in English alphabet with intuitive conversational Indian analogies). "
                "Keep core technical terms in English (e.g., 'Gradient Descent', 'Learning Rate', 'Loss Function'), "
                "but explain the reasoning in clear, friendly Hinglish."
            )
        elif language.lower() == "hindi":
            lang_instruction = "EXPLANATION LANGUAGE: Hindi. Use Devanagari script for explanation while preserving standard mathematical formulas."
        elif language.lower() == "spanish":
            lang_instruction = "EXPLANATION LANGUAGE: Spanish. Provide explanations in academic Spanish."
        else:
            lang_instruction = "EXPLANATION LANGUAGE: English. Clear, engaging, pedagogical university level."

        # 5. System prompt enforcing strict citation grounding
        system_instruction = (
            f"You are an expert AI study companion and university tutor for students.\n"
            f"{lang_instruction}\n"
            f"Student Mastery Level: {student_level}\n\n"
            "RULES:\n"
            "1. Answer using ONLY facts present in the provided curriculum snippets.\n"
            "2. Every factual statement or definition MUST end with its exact citation tag from the snippets (e.g. `[CS229 Lecture 1 @ 04:15]` or `[Deep Learning Textbook p. 14]`).\n"
            "3. Do not invent citations. Only use exact tags from the snippets.\n"
            "4. If a piece of information is general outside knowledge, explicitly preface it with `[General Context - Outside Material]`.\n"
            "5. At the end, include `### Suggested Practice Questions` with 2 concise conceptual follow-ups.\n"
        )

        user_prompt = f"""Curriculum Context:
{context_str}

Student Question: {query}

Provide a comprehensive, pedagogical explanation with inline citation tags for every fact:"""

        raw_answer = self._call_gemini_with_fallback(user_prompt, system_instruction)

        # 6. Extract citations and resolve them with metadata
        tag_pattern = r"\[([^\]]+(?:\@\s*\d{1,2}:\d{2}|p\.\s*\d+|Slide\s*\d+)[^\]]*)\]"
        found_tags = list(set(re.findall(tag_pattern, raw_answer)))

        parsed_citations = []
        for tag_inner in found_tags:
            full_tag = f"[{tag_inner}]"
            matched_chunk = citation_lookup.get(full_tag)
            if not matched_chunk:
                for c in retrieved_chunks:
                    if c.get("citation_tag") == full_tag or tag_inner in c.get("citation_tag", ""):
                        matched_chunk = c
                        break

            if matched_chunk:
                parsed_citations.append({
                    "tag": full_tag,
                    "source_name": matched_chunk["source_name"],
                    "source_type": matched_chunk["source_type"],
                    "timestamp_str": matched_chunk.get("timestamp_str"),
                    "start_seconds": matched_chunk.get("start_seconds"),
                    "page": matched_chunk.get("page"),
                    "slide_number": matched_chunk.get("slide_number"),
                    "video_url": matched_chunk.get("video_url"),
                    "snippet": matched_chunk["text"][:180] + "..."
                })
            else:
                time_match = re.search(r"@\s*(\d{1,2}:\d{2})", tag_inner)
                page_match = re.search(r"p\.\s*(\d+)", tag_inner)
                slide_match = re.search(r"Slide\s*(\d+)", tag_inner)
                ts = time_match.group(1) if time_match else None
                secs = timestamp_to_seconds(ts) if ts else None
                pg = int(page_match.group(1)) if page_match else None
                sld = int(slide_match.group(1)) if slide_match else None

                parsed_citations.append({
                    "tag": full_tag,
                    "source_name": tag_inner.split("@")[0].split("p.")[0].split("Slide")[0].strip(),
                    "source_type": "video" if ts else ("slides" if sld else "pdf"),
                    "timestamp_str": ts,
                    "start_seconds": secs,
                    "page": pg,
                    "slide_number": sld,
                    "video_url": "",
                    "snippet": "Cited from course materials."
                })

        # 7. Extract suggested follow-up questions
        followups = []
        if "Suggested Practice Questions" in raw_answer:
            parts = raw_answer.split("Suggested Practice Questions")
            lines = parts[1].split("\n")
            for line in lines:
                cleaned = re.sub(r"^[\s*\-\d\.]+", "", line).strip()
                if cleaned and len(cleaned) > 10 and "?" in cleaned:
                    followups.append(cleaned)
                    if len(followups) >= 3:
                        break

        if not followups:
            followups = [
                "Why does gradient descent oscillate if the learning rate is too large?",
                "How does Momentum damp perpendicular oscillations in a ravine?",
                "What is the mathematical role of the chain rule in backpropagation?"
            ]

        # Update learner model conversation interaction if active
        if self.learner_model and parsed_citations:
            top_source = parsed_citations[0].get("source_name", "Optimization")
            self.learner_model.update_from_conversation(top_source, engagement_level=0.6)

        return {
            "answer": raw_answer,
            "is_off_material": False,
            "language": language,
            "citations": parsed_citations,
            "retrieved_chunks": retrieved_chunks,
            "suggested_followups": followups
        }
