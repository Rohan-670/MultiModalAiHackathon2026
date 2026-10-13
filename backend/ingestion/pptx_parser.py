from pathlib import Path
from typing import List, Dict, Any
from pptx import Presentation

class PPTXParser:
    """Extracts text, slide titles, notes, and visual layout from PowerPoint decks (.pptx)."""

    def parse_pptx(self, file_path: str | Path, source_id: str = None) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Presentation file not found: {path}")

        source_name = source_id or path.name
        prs = Presentation(str(path))
        chunks = []

        for idx, slide in enumerate(prs.slides):
            slide_no = idx + 1
            slide_text_parts = []
            title = ""

            # Extract title and shape texts
            for shape in slide.shapes:
                if shape.has_text_frame:
                    text = shape.text_frame.text.strip()
                    if text:
                        if not title and shape == slide.shapes[0]:
                            title = text
                        slide_text_parts.append(text)

            # Check speaker notes
            notes_text = ""
            if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                notes = slide.notes_slide.notes_text_frame.text.strip()
                if notes:
                    notes_text = f"Speaker Notes: {notes}"

            combined_text = "\n".join(slide_text_parts)
            if notes_text:
                combined_text += f"\n{notes_text}"

            if not combined_text.strip():
                continue

            chunks.append({
                "id": f"{source_name}_s{slide_no}",
                "source_name": source_name,
                "source_type": "slides",
                "page": slide_no,
                "slide_number": slide_no,
                "timestamp_str": None,
                "start_seconds": None,
                "end_seconds": None,
                "text": combined_text,
                "citation_tag": f"[{source_name} Slide {slide_no}]",
                "slide_title": title or f"Slide {slide_no}"
            })

        return chunks
