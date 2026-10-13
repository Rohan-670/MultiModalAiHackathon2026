from pathlib import Path
from typing import List, Dict, Any
import pypdf

class PDFParser:
    """Extracts text and page-aware semantic chunks from PDF documents."""

    def __init__(self, chunk_size: int = 400, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def parse_pdf(self, file_path: str | Path, source_id: str = None) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {path}")

        source_name = source_id or path.name
        chunks = []
        reader = pypdf.PdfReader(str(path))

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            text = page.extract_text() or ""
            text = text.strip()
            if not text:
                continue

            # Split into semantic paragraphs / chunking
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            current_chunk = ""

            for p in paragraphs:
                if len(current_chunk) + len(p) < self.chunk_size:
                    current_chunk += ("\n" + p if current_chunk else p)
                else:
                    if current_chunk:
                        chunks.append({
                            "id": f"{source_name}_p{page_num}_{len(chunks)}",
                            "source_name": source_name,
                            "source_type": "pdf",
                            "page": page_num,
                            "timestamp_str": None,
                            "start_seconds": None,
                            "end_seconds": None,
                            "text": current_chunk,
                            "citation_tag": f"[{source_name} p. {page_num}]"
                        })
                    current_chunk = p

            if current_chunk:
                chunks.append({
                    "id": f"{source_name}_p{page_num}_{len(chunks)}",
                    "source_name": source_name,
                    "source_type": "pdf",
                    "page": page_num,
                    "timestamp_str": None,
                    "start_seconds": None,
                    "end_seconds": None,
                    "text": current_chunk,
                    "citation_tag": f"[{source_name} p. {page_num}]"
                })

        return chunks
