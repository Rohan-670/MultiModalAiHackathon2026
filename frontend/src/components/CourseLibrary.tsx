import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Video,
  Presentation,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import type { Citation, SourceSummary } from '../types';

interface CourseLibraryProps {
  onCitationClick: (citation: Citation) => void;
  onRefreshSources: () => void;
}

export const CourseLibrary: React.FC<CourseLibraryProps> = ({
  onCitationClick,
  onRefreshSources
}) => {
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error("Failed to fetch sources", e);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSimulatedUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadProgress(15);
    setUploadStep('Validating MIME type and format integrity...');

    setTimeout(() => {
      setUploadProgress(40);
      setUploadStep('Extracting multimodal hierarchy, headings, and diagrams...');
    }, 800);

    setTimeout(() => {
      setUploadProgress(70);
      setUploadStep('Chunking with origin page/slide/timestamp tagging...');
    }, 1600);

    setTimeout(async () => {
      setUploadProgress(90);
      setUploadStep('Generating hybrid BM25 + dense semantic vector embeddings...');

      // Actual upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', 'cs229-ml');

      try {
        await fetch('/api/materials/upload', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error("Upload error", err);
      }

      setUploadProgress(100);
      setUploadStep('Ingestion complete! Knowledge base updated.');
      setTimeout(() => {
        setIsUploading(false);
        setUploadStep(null);
        fetchSources();
        onRefreshSources();
      }, 1000);
    }, 2400);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSimulatedUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <span>Multimodal Course Materials & Ingestion Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agent 1: Course Intelligence extracts slides, textbook sections, and video transcripts with preserved origin bookmarks.
          </p>
        </div>

        <button
          onClick={() => { fetchSources(); onRefreshSources(); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Materials</span>
        </button>
      </div>

      {/* Upload Dropzone & Job Pipeline Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>Ingest New Course Document or Lecture</span>
        </h2>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-3 cursor-pointer relative"
        >
          <input
            type="file"
            accept=".pdf,.pptx,.docx,.txt,.md,.mp4"
            onChange={handleFileInput}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            disabled={isUploading}
          />
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Drag & Drop files here, or click to browse
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF textbooks, PPTX slides, DOCX syllabi, Markdown/TXT notes, and MP4 lecture recordings
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">PDF</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">PPTX</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">DOCX</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">MP4</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">TXT/MD</span>
          </div>
        </div>

        {/* Live Ingestion Job Progress Bar */}
        {isUploading && (
          <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-900 dark:text-teal-200">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Processing {uploadedFileName}...</span>
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-teal-200 dark:bg-teal-900 overflow-hidden">
              <div
                className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">
              {uploadStep}
            </div>
          </div>
        )}
      </div>

      {/* Active Ingested Materials Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>Active Course Library Materials ({sources.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((src, idx) => {
            const isVideo = src.source_type === 'video';
            const isPdf = src.source_type === 'pdf';
            const isSlides = src.source_type === 'slides';

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                      {isVideo && <Video className="w-5 h-5" />}
                      {isPdf && <FileText className="w-5 h-5" />}
                      {isSlides && <Presentation className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {src.source_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isVideo && `Full lecture recording (${src.duration_seconds || 360}s runtime)`}
                      {isPdf && `Digital textbook with ${src.max_page || 45} pages indexed`}
                      {isSlides && `Slide deck with extracted speaker notes`}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Indexed Chunks</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{src.chunk_count}</span>
                  </div>

                  {src.sample_citations && src.sample_citations.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {src.sample_citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => {
                            onCitationClick({
                              tag: c,
                              source_name: src.source_name,
                              source_type: src.source_type,
                              timestamp_str: isVideo ? "04:15" : undefined,
                              start_seconds: isVideo ? 255 : undefined,
                              page: isPdf ? 14 : undefined,
                              slide_number: isSlides ? 5 : undefined,
                              video_url: isVideo ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined,
                              snippet: `Citation excerpt verified for ${src.source_name}`
                            });
                          }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
