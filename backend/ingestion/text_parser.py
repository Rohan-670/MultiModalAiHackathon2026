from pathlib import Path
from typing import List, Dict, Any

class TextParser:
    """Parses plain text (.txt) and Markdown (.md) notes into structured semantic sections."""

    def __init__(self, chunk_size: int = 400):
        self.chunk_size = chunk_size

    def parse_text(self, file_path: str | Path, source_id: str = None) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Text file not found: {path}")

        source_name = source_id or path.name
        content = path.read_text(encoding="utf-8", errors="ignore")
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]

        chunks = []
        current = []
        sec = 1

        for p in paragraphs:
            current.append(p)
            if sum(len(x) for x in current) >= self.chunk_size:
                text_block = "\n\n".join(current)
                chunks.append({
                    "id": f"{source_name}_p{sec}",
                    "source_name": source_name,
                    "source_type": "text",
                    "page": sec,
                    "timestamp_str": None,
                    "start_seconds": None,
                    "end_seconds": None,
                    "text": text_block,
                    "citation_tag": f"[{source_name} § {sec}]"
                })
                sec += 1
                current = []

        if current:
            text_block = "\n\n".join(current)
            chunks.append({
                "id": f"{source_name}_p{sec}",
                "source_name": source_name,
                "source_type": "text",
                "page": sec,
                "timestamp_str": None,
                "start_seconds": None,
                "end_seconds": None,
                "text": text_block,
                "citation_tag": f"[{source_name} § {sec}]"
            })

        return chunks
