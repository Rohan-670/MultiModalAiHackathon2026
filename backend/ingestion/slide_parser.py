from pathlib import Path
from typing import List, Dict, Any
import pypdf

class SlideParser:
    """Parses slide decks and exports structured slide representations with citations."""

    def parse_slide_pdf(self, file_path: str | Path, source_id: str = None) -> List[Dict[str, Any]]:
        path = Path(file_path)
        source_name = source_id or path.name
        chunks = []

        reader = pypdf.PdfReader(str(path))
        for idx, page in enumerate(reader.pages):
            slide_no = idx + 1
            text = (page.extract_text() or "").strip()
            if not text:
                continue

            # In slides, each slide is an atomic visual concept chunk
            chunks.append({
                "id": f"{source_name}_s{slide_no}",
                "source_name": source_name,
                "source_type": "slides",
                "page": slide_no,
                "slide_number": slide_no,
                "timestamp_str": None,
                "start_seconds": None,
                "end_seconds": None,
                "text": text,
                "citation_tag": f"[{source_name} Slide {slide_no}]"
            })

        return chunks
