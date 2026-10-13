from pathlib import Path
from typing import List, Dict, Any
from docx import Document

class DOCXParser:
    """Extracts text, headings, and tables from Word documents (.docx) with paragraph preservation."""

    def __init__(self, chunk_size: int = 400):
        self.chunk_size = chunk_size

    def parse_docx(self, file_path: str | Path, source_id: str = None) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"DOCX file not found: {path}")

        source_name = source_id or path.name
        doc = Document(str(path))
        chunks = []
        current_chunk = []
        current_heading = "General"
        section_idx = 1

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            if para.style.name.startswith("Heading"):
                current_heading = text

            current_chunk.append(text)
            combined_len = sum(len(t) for t in current_chunk)

            if combined_len >= self.chunk_size:
                chunk_str = "\n".join(current_chunk)
                chunks.append({
                    "id": f"{source_name}_sec{section_idx}",
                    "source_name": source_name,
                    "source_type": "docx",
                    "page": section_idx,
                    "section_title": current_heading,
                    "timestamp_str": None,
                    "start_seconds": None,
                    "end_seconds": None,
                    "text": chunk_str,
                    "citation_tag": f"[{source_name} § {section_idx}]"
                })
                section_idx += 1
                current_chunk = []

        if current_chunk:
            chunk_str = "\n".join(current_chunk)
            chunks.append({
                "id": f"{source_name}_sec{section_idx}",
                "source_name": source_name,
                "source_type": "docx",
                "page": section_idx,
                "section_title": current_heading,
                "timestamp_str": None,
                "start_seconds": None,
                "end_seconds": None,
                "text": chunk_str,
                "citation_tag": f"[{source_name} § {section_idx}]"
            })

        return chunks
