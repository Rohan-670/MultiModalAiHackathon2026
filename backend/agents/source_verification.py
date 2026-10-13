import re
from typing import List, Dict, Any, Tuple

class SourceVerificationAgent:
    """
    Agent 2: Source Verification Agent
    Responsibilities:
    - Verifies whether proposed answers are factually supported by retrieved sources
    - Validates that every citation tag exists in the retrieved documents
    - Flags unsupported claims or hallucinations
    - Computes a verifiable Grounding Fidelity Score (0.0 to 1.0)
    """

    def verify_answer(
        self,
        query: str,
        answer: str,
        retrieved_chunks: List[Dict[str, Any]],
        parsed_citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Runs deterministic verification checks on the generated answer.
        """
        if not retrieved_chunks:
            return {
                "is_verified": False,
                "grounding_fidelity_score": 0.0,
                "unsupported_claims": ["No course materials were retrieved for this query."],
                "citation_validity": "Invalid (No sources)",
                "verification_status": "Failed"
            }

        combined_context = " ".join([c.get("text", "") for c in retrieved_chunks]).lower()
        chunk_tags = set([c.get("citation_tag", "") for c in retrieved_chunks])

        # 1. Check citation tags exist in retrieved chunks
        valid_citations = 0
        invalid_citations = []
        for cite in parsed_citations:
            tag = cite.get("tag", "")
            # check exact or partial tag match
            if any(tag in ct or ct in tag for ct in chunk_tags):
                valid_citations += 1
            else:
                invalid_citations.append(tag)

        citation_ratio = (valid_citations / max(len(parsed_citations), 1)) if parsed_citations else 1.0

        # 2. Extract sentence-level claims from answer and verify against source text
        sentences = [s.strip() for s in re.split(r"[.!?]", answer) if len(s.strip()) > 20]
        supported_sentences = 0
        unsupported_claims = []

        for s in sentences:
            # ignore header lines
            if s.startswith("#") or "Suggested Practice" in s:
                continue
            words = [w for w in re.findall(r"\w+", s.lower()) if len(w) > 3]
            if not words:
                continue
            matches = sum(1 for w in words if w in combined_context)
            overlap_pct = matches / len(words)
            if overlap_pct >= 0.30:
                supported_sentences += 1
            else:
                unsupported_claims.append(s[:100] + "...")

        total_tested = max(len(sentences), 1)
        content_fidelity = round(supported_sentences / total_tested, 3)

        # Composite Grounding Fidelity Score
        composite_score = round(0.6 * content_fidelity + 0.4 * citation_ratio, 3)
        is_verified = composite_score >= 0.60

        return {
            "is_verified": is_verified,
            "grounding_fidelity_score": composite_score,
            "fidelity_percentage": round(composite_score * 100, 1),
            "valid_citations_count": valid_citations,
            "invalid_citations": invalid_citations,
            "unsupported_claims": unsupported_claims[:3],
            "verification_status": "Verified Grounded" if is_verified else "Caution: Partial Grounding"
        }
