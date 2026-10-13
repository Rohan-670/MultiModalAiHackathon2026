import time
import json
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.ingestion.pdf_parser import PDFParser
from backend.ingestion.pptx_parser import PPTXParser
from backend.ingestion.docx_parser import DOCXParser
from backend.ingestion.text_parser import TextParser
from backend.ingestion.video_processor import VideoProcessor
from backend.database.models import ProcessingJob, Material, Course

class SmartMaterialIngestor:
    """
    Smart Material Ingestion Coordinator:
    - Validates file types and sizes.
    - Dispatches to specialized extractors (PDF, PPTX, DOCX, TXT/MD, Video/Audio).
    - Tracks multi-stage progress in the database (Queued -> Extracting -> Chunking -> Indexing -> Completed).
    - Updates course knowledge base and vector store.
    """

    SUPPORTED_EXTENSIONS = {
        ".pdf": "pdf",
        ".pptx": "slides",
        ".docx": "docx",
        ".txt": "text",
        ".md": "text",
        ".mp4": "video",
        ".json": "transcript"
    }

    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.pdf_parser = PDFParser()
        self.pptx_parser = PPTXParser()
        self.docx_parser = DOCXParser()
        self.text_parser = TextParser()
        self.video_processor = VideoProcessor()

    def process_file_sync(
        self,
        file_path: Path,
        filename: str,
        course_id: str,
        user_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Processes an uploaded file synchronously or inside a background worker.
        """
        ext = file_path.suffix.lower()
        job_id = f"job_{int(time.time() * 1000)}"

        # 1. Validation
        if ext not in self.SUPPORTED_EXTENSIONS:
            error_msg = f"Unsupported file extension '{ext}'. Supported formats: PDF, PPTX, DOCX, TXT, MD, MP4, JSON transcript."
            job = ProcessingJob(
                id=job_id,
                user_id=user_id,
                course_id=course_id,
                filename=filename,
                file_type=ext.replace(".", ""),
                status="failed",
                progress_pct=100,
                stage="Validation Failed",
                message=error_msg,
                error_details=error_msg
            )
            db.add(job)
            db.commit()
            return {"job_id": job_id, "status": "failed", "message": error_msg, "chunks": 0}

        file_size = file_path.stat().st_size
        if file_size > self.MAX_FILE_SIZE_BYTES:
            error_msg = f"File exceeds maximum allowed size of 50 MB ({round(file_size / (1024*1024), 2)} MB)."
            job = ProcessingJob(
                id=job_id,
                user_id=user_id,
                course_id=course_id,
                filename=filename,
                file_type=ext.replace(".", ""),
                status="failed",
                progress_pct=100,
                stage="Validation Failed",
                message=error_msg
            )
            db.add(job)
            db.commit()
            return {"job_id": job_id, "status": "failed", "message": error_msg, "chunks": 0}

        # 2. Register Job
        job = ProcessingJob(
            id=job_id,
            user_id=user_id,
            course_id=course_id,
            filename=filename,
            file_type=self.SUPPORTED_EXTENSIONS[ext],
            status="processing",
            progress_pct=15,
            stage="Extracting Content",
            message=f"Extracting educational units from {filename}..."
        )
        db.add(job)
        db.commit()

        # 3. Extraction
        try:
            chunks: List[Dict[str, Any]] = []

            if ext == ".pdf":
                chunks = self.pdf_parser.parse_pdf(file_path, source_id=filename)
            elif ext == ".pptx":
                chunks = self.pptx_parser.parse_pptx(file_path, source_id=filename)
            elif ext == ".docx":
                chunks = self.docx_parser.parse_docx(file_path, source_id=filename)
            elif ext in [".txt", ".md"]:
                chunks = self.text_parser.parse_text(file_path, source_id=filename)
            elif ext == ".json":
                with open(file_path, "r", encoding="utf-8") as jf:
                    data = json.load(jf)
                    chunks = self.video_processor.process_transcript_segments(data, source_name=filename)
            else:
                chunks = []

            if not chunks:
                job.status = "failed"
                job.progress_pct = 100
                job.stage = "Extraction Empty"
                job.message = f"No readable text content could be extracted from {filename}."
                db.commit()
                return {"job_id": job_id, "status": "failed", "message": job.message, "chunks": 0}

            # Update progress
            job.progress_pct = 60
            job.stage = "Generating Semantic Embeddings"
            job.message = f"Extracted {len(chunks)} units. Indexing into hybrid vector store..."
            db.commit()

            # 4. Vector Store Indexing
            self.vector_store.add_documents(chunks)

            # 5. Save Material record
            mat_id = f"mat_{abs(hash(filename)) % 1000000}"
            material = Material(
                id=mat_id,
                course_id=course_id,
                filename=filename,
                file_type=self.SUPPORTED_EXTENSIONS[ext],
                file_path=str(file_path),
                status="processed",
                chunk_count=len(chunks),
                metadata_json=json.dumps({"file_size_kb": round(file_size / 1024, 1), "chunks": len(chunks)})
            )
            db.add(material)

            # Update course file count
            course = db.query(Course).filter(Course.id == course_id).first()
            if course:
                course.file_count = (course.file_count or 0) + 1

            # Job completion
            job.status = "completed"
            job.progress_pct = 100
            job.stage = "Indexed Successfully"
            job.message = f"Successfully parsed and indexed {len(chunks)} chunks into course knowledge base."
            db.commit()

            return {
                "job_id": job_id,
                "status": "completed",
                "message": job.message,
                "chunks": len(chunks),
                "material_id": mat_id
            }

        except Exception as e:
            job.status = "failed"
            job.progress_pct = 100
            job.stage = "Processing Error"
            job.message = f"Failed to process {filename}: {str(e)}"
            job.error_details = str(e)
            db.commit()
            return {"job_id": job_id, "status": "failed", "message": str(e), "chunks": 0}
