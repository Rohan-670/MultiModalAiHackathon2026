import re
from pathlib import Path
from typing import List, Dict, Any
from backend.config import gemini_client, DEFAULT_MODEL

def seconds_to_timestamp(seconds: float) -> str:
    """Format seconds into MM:SS or HH:MM:SS."""
    secs = int(seconds)
    mins = secs // 60
    rem_secs = secs % 60
    hours = mins // 60
    rem_mins = mins % 60
    if hours > 0:
        return f"{hours:02d}:{rem_mins:02d}:{rem_secs:02d}"
    return f"{rem_mins:02d}:{rem_secs:02d}"

def timestamp_to_seconds(ts: str) -> float:
    """Parse MM:SS or HH:MM:SS string to seconds."""
    parts = ts.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    elif len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return 0.0

class VideoProcessor:
    """Processes lecture videos and audio files into timestamped semantic transcript chunks."""

    def __init__(self, target_chunk_duration: float = 30.0):
        self.target_chunk_duration = target_chunk_duration

    def process_transcript_segments(
        self,
        segments: List[Dict[str, Any]],
        source_name: str,
        video_url: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Group fine-grained segments into coherent semantic lecture chunks with exact start_time
        and citation tags.
        """
        chunks = []
        current_text = []
        chunk_start = 0.0
        chunk_end = 0.0

        for seg in segments:
            start = seg.get("start_time", 0.0)
            end = seg.get("end_time", start + 5.0)
            text = seg.get("text", "").strip()
            if not text:
                continue

            if not current_text:
                chunk_start = start

            current_text.append(text)
            chunk_end = end

            # When chunk duration reaches target or ends natural sentence
            if (chunk_end - chunk_start) >= self.target_chunk_duration:
                ts_str = seconds_to_timestamp(chunk_start)
                combined_text = " ".join(current_text)
                chunks.append({
                    "id": f"{source_name}_t{int(chunk_start)}_{len(chunks)}",
                    "source_name": source_name,
                    "source_type": "video",
                    "page": None,
                    "timestamp_str": ts_str,
                    "start_seconds": chunk_start,
                    "end_seconds": chunk_end,
                    "video_url": video_url,
                    "text": combined_text,
                    "citation_tag": f"[{source_name} @ {ts_str}]"
                })
                current_text = []

        if current_text:
            ts_str = seconds_to_timestamp(chunk_start)
            combined_text = " ".join(current_text)
            chunks.append({
                "id": f"{source_name}_t{int(chunk_start)}_{len(chunks)}",
                "source_name": source_name,
                "source_type": "video",
                "page": None,
                "timestamp_str": ts_str,
                "start_seconds": chunk_start,
                "end_seconds": chunk_end,
                "video_url": video_url,
                "text": combined_text,
                "citation_tag": f"[{source_name} @ {ts_str}]"
            })

        return chunks

    def transcribe_with_gemini(self, file_path: str | Path, source_name: str = None) -> List[Dict[str, Any]]:
        """
        Uploads audio/video file directly to Gemini Files API and transcribes with timestamps.
        """
        path = Path(file_path)
        name = source_name or path.name

        if not gemini_client:
            raise RuntimeError("Gemini Client not configured. GEMINI_API_KEY is required.")

        print(f"[VideoProcessor] Uploading {path.name} to Gemini File API...")
        uploaded_file = gemini_client.files.upload(file=str(path))

        prompt = """You are an audio/video transcription engine.
Transcribe the speech in this media into timestamped segments.
Return strictly valid JSON in the following format:
[
  {
    "start_time": 0.0,
    "end_time": 15.5,
    "text": "Welcome to today's lecture on optimization and gradient descent."
  }
]
Do not wrap in markdown or any other explanation. Just the raw JSON array.
"""
        response = gemini_client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=[uploaded_file, prompt]
        )

        import json
        raw = response.text.strip()
        # Clean markdown code blocks if any
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-zA-Z]*\n", "", raw)
            raw = re.sub(r"\n```$", "", raw)

        segments = json.loads(raw)
        return self.process_transcript_segments(segments, source_name=name)
