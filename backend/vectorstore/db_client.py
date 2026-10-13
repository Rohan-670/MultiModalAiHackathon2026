import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from rank_bm25 import BM25Okapi

from backend.config import DATA_DIR
from backend.vectorstore.embeddings import EmbeddingEngine

class HybridVectorStore:
    """
    Production-ready Hybrid Vector Store combining:
    1. Dense semantic embeddings (Gemini embedding-001)
    2. BM25 keyword retrieval (BM25Okapi)
    3. Metadata filtering (by source type, source name, page, timestamp)
    4. Fast persistence to disk
    """

    def __init__(self, persist_path: Optional[Path] = None):
        self.persist_path = persist_path or (DATA_DIR / "hybrid_index.json")
        self.embedder = EmbeddingEngine()
        self.documents: List[Dict[str, Any]] = []
        self.dense_embeddings: List[List[float]] = []
        self.bm25: Optional[BM25Okapi] = None
        self.tokenized_corpus: List[List[str]] = []

        # Load existing index if present
        self.load()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\w+", text.lower())

    def add_documents(self, chunks: List[Dict[str, Any]]):
        """Add new chunks, generate embeddings, and re-fit BM25 index."""
        if not chunks:
            return

        texts_to_embed = [c["text"] for c in chunks]
        new_embeddings = self.embedder.get_embeddings_batch(texts_to_embed)

        for chunk, emb in zip(chunks, new_embeddings):
            # Ensure unique ID
            if not any(d["id"] == chunk["id"] for d in self.documents):
                self.documents.append(chunk)
                self.dense_embeddings.append(emb)

        self._rebuild_bm25()
        self.save()
        print(f"[VectorStore] Indexed {len(chunks)} chunks. Total documents: {len(self.documents)}")

    def _rebuild_bm25(self):
        if not self.documents:
            self.bm25 = None
            self.tokenized_corpus = []
            return

        self.tokenized_corpus = [self._tokenize(doc["text"]) for doc in self.documents]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        alpha: float = 0.65  # Weight for dense embeddings (1 - alpha for BM25)
    ) -> List[Dict[str, Any]]:
        """
        Hybrid retrieval combining Dense Vector Search + BM25 keyword search.
        Applies metadata filters when provided.
        """
        if not self.documents:
            return []

        # 1. Dense search scores
        target_dim = len(self.dense_embeddings[0]) if self.dense_embeddings else 3072
        query_emb = self.embedder.get_embedding(query, target_dim=target_dim)
        q_vec = np.array(query_emb, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)

        dense_scores = np.zeros(len(self.documents), dtype=np.float32)
        if q_norm > 0 and len(self.dense_embeddings) > 0:
            doc_mat = np.array(self.dense_embeddings, dtype=np.float32)
            if doc_mat.shape[1] == len(q_vec):
                doc_norms = np.linalg.norm(doc_mat, axis=1)
                doc_norms[doc_norms == 0] = 1e-8
                dense_scores = np.dot(doc_mat, q_vec) / (doc_norms * q_norm)
                dense_min, dense_max = dense_scores.min(), dense_scores.max()
                if dense_max > dense_min:
                    dense_scores = (dense_scores - dense_min) / (dense_max - dense_min)
                else:
                    dense_scores = np.ones_like(dense_scores) * 0.5
            else:
                # Dimension padding/truncation safeguard if vectors ever differ
                print(f"[VectorStore Warning] Dimension mismatch: doc_mat {doc_mat.shape[1]} vs query {len(q_vec)}")
                dense_scores = np.ones(len(self.documents), dtype=np.float32) * 0.5

        # 2. BM25 keyword scores
        bm25_scores = np.zeros(len(self.documents), dtype=np.float32)
        if self.bm25:
            tokenized_query = self._tokenize(query)
            if tokenized_query:
                raw_bm25 = np.array(self.bm25.get_scores(tokenized_query), dtype=np.float32)
                b_min, b_max = raw_bm25.min(), raw_bm25.max()
                if b_max > b_min:
                    bm25_scores = (raw_bm25 - b_min) / (b_max - b_min)
                elif b_max > 0:
                    bm25_scores = raw_bm25 / b_max

        # 3. Hybrid fusion score
        combined_scores = alpha * dense_scores + (1.0 - alpha) * bm25_scores

        # 4. Rank and filter
        scored_indices = np.argsort(combined_scores)[::-1]

        results = []
        for idx in scored_indices:
            doc = self.documents[idx]

            # Apply metadata filters if provided
            if filters:
                match = True
                for k, v in filters.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            result_item = dict(doc)
            result_item["similarity_score"] = float(combined_scores[idx])
            result_item["dense_score"] = float(dense_scores[idx])
            result_item["bm25_score"] = float(bm25_scores[idx])
            results.append(result_item)

            if len(results) >= top_k:
                break

        return results

    def get_all_sources(self) -> List[Dict[str, Any]]:
        """Summarize all indexed sources and their statistics."""
        summary: Dict[str, Dict[str, Any]] = {}
        for doc in self.documents:
            name = doc["source_name"]
            stype = doc["source_type"]
            if name not in summary:
                summary[name] = {
                    "source_name": name,
                    "source_type": stype,
                    "chunk_count": 0,
                    "video_url": doc.get("video_url"),
                    "max_page": 0,
                    "duration_seconds": 0.0,
                    "sample_citations": []
                }
            summary[name]["chunk_count"] += 1
            if doc.get("page"):
                summary[name]["max_page"] = max(summary[name]["max_page"], doc["page"])
            if doc.get("end_seconds"):
                summary[name]["duration_seconds"] = max(summary[name]["duration_seconds"], doc["end_seconds"])
            if len(summary[name]["sample_citations"]) < 3 and doc.get("citation_tag"):
                summary[name]["sample_citations"].append(doc["citation_tag"])

        return list(summary.values())

    def save(self):
        try:
            data = {
                "documents": self.documents,
                "dense_embeddings": self.dense_embeddings
            }
            with open(self.persist_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
        except Exception as e:
            print(f"[VectorStore] Error saving index: {e}")

    def load(self):
        if self.persist_path.exists():
            try:
                with open(self.persist_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data.get("documents", [])
                    self.dense_embeddings = data.get("dense_embeddings", [])
                self._rebuild_bm25()
                print(f"[VectorStore] Loaded {len(self.documents)} documents from disk.")
            except Exception as e:
                print(f"[VectorStore] Could not load persisted index: {e}")
