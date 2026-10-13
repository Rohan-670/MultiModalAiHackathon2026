import React, { useState } from 'react';
import { X, Database, Video, BookOpen, Layers, Upload, Plus, CheckCircle2 } from 'lucide-react';
import type { SourceSummary, Citation } from '../types';

interface SourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceSummary[];
  onSelectCitation: (cit: Citation) => void;
  onRefreshSources: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({
  isOpen,
  onClose,
  sources,
  onSelectCitation,
  onRefreshSources,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Upload Form states
  const [sourceName, setSourceName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleUploadPDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus("Parsing and indexing PDF semantic paragraphs...");
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || "PDF indexed successfully!");
      onRefreshSources();
      setSelectedFile(null);
    } catch {
      setUploadStatus("Upload failed. Please check backend status.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !sourceName) return;

    setIsUploading(true);
    setUploadStatus("Segmenting timestamped lecture video chunks...");
    const formData = new FormData();
    formData.append('source_name', sourceName);
    formData.append('video_url', videoUrl);
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload/transcript', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || "Transcript indexed successfully!");
      onRefreshSources();
      setSelectedFile(null);
      setSourceName('');
      setVideoUrl('');
    } catch {
      setUploadStatus("Upload failed. Please check backend status.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Course Knowledge Base Drawer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'list'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Ingested Sources ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Upload New Material
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'list' ? (
            sources.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No sources indexed yet.</p>
            ) : (
              sources.map((src, i) => (
                <div
                  key={i}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {src.source_type === 'video' ? (
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Video className="w-4 h-4" />
                        </div>
                      ) : src.source_type === 'slides' ? (
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Layers className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{src.source_name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {src.source_type} • {src.chunk_count} semantic chunks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample citations preview */}
                  {src.sample_citations && src.sample_citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">
                      {src.sample_citations.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => {
                            onSelectCitation({
                              tag,
                              source_name: src.source_name,
                              source_type: src.source_type,
                              timestamp_str: tag.match(/@\s*(\d{1,2}:\d{2})/)?.[1],
                              page: parseInt(tag.match(/p\.\s*(\d+)/)?.[1] || "14"),
                              snippet: `Preview from ${src.source_name}`
                            });
                            onClose();
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-950 border border-slate-700 text-indigo-300 font-mono transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            /* Upload Pipeline Form */
            <div className="space-y-4">
              {uploadStatus && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/50 text-xs text-indigo-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* PDF Form */}
              <form onSubmit={handleUploadPDF} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Upload Textbook / Paper (PDF)
                </h4>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-700 file:text-white"
                />
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Index PDF Textbook
                </button>
              </form>

              {/* Lecture Transcript Form */}
              <form onSubmit={handleUploadTranscript} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  Upload Lecture Video Transcript
                </h4>
                <input
                  type="text"
                  placeholder="Lecture Name (e.g. CS229 Lecture 2)"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Video URL (e.g. mp4 link or YouTube)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-700 file:text-white"
                />
                <button
                  type="submit"
                  disabled={!selectedFile || !sourceName || isUploading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Index Lecture Timestamps
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
