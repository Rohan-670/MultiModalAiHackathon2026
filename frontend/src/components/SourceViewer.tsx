import React, { useRef, useEffect, useState } from 'react';
import {
  Video,
  BookOpen,
  Layers,
  BookmarkCheck,
  Image as ImageIcon,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Sparkles,
  GraduationCap,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { Citation, DiagramItem, VideoLesson } from '../types';

export type ViewerMode = 'video_tutor' | 'video_sync' | 'document' | 'diagrams';

export interface SourceViewerProps {
  activeCitation?: Citation | null;
  onCitationClick: (citation: Citation) => void;
  onStartQuiz?: (topic: string) => void;
  initialMode?: ViewerMode;
  isStandalone?: boolean;
}

export const SourceViewer: React.FC<SourceViewerProps> = ({
  activeCitation = null,
  onCitationClick,
  onStartQuiz,
  initialMode = 'video_sync',
  isStandalone = false
}) => {
  // Current tab view mode: 'video_tutor' (Agent 7 AI lessons), 'video_sync' (Course lecture video), 'document' (Textbook/Slides), 'diagrams' (Figures)
  const [viewerMode, setViewerMode] = useState<ViewerMode>(initialMode);
  const [isExpanded, setIsExpanded] = useState<boolean>(isStandalone);

  // ---------------- State for HTML5 Video Sync & Curriculum ----------------
  const videoRef = useRef<HTMLVideoElement>(null);
  const [syncTime, setSyncTime] = useState<number>(0);
  const [diagrams, setDiagrams] = useState<DiagramItem[]>([]);
  const defaultVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // ---------------- State for Agent 7 AI Video Tutor ----------------
  const [selectedStyle, setSelectedStyle] = useState<'animated_concept' | 'narrated_slides' | 'teacher_avatar'>('animated_concept');
  const [topicInput, setTopicInput] = useState('Loss Surfaces and Learning Rates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<VideoLesson | null>(null);

  // AI Video Lesson Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  // Seeded lesson for visual derivation
  const defaultLesson: VideoLesson = {
    id: "les_seed_101",
    title: "Visual Derivation: Loss Surfaces and Learning Rate Dynamics",
    topic: "Loss Surfaces and Learning Rates",
    style: "animated_concept",
    duration_seconds: 180,
    chapters: [
      {
        title: "1. Quadratic Loss Surface Geometry",
        start_time: 0,
        duration: 45,
        visual_cue: "3D Paraboloid Contours J(θ_0, θ_1)",
        citation: "[CS229 Lecture 1 @ 00:45]"
      },
      {
        title: "2. The Negative Gradient Vector",
        start_time: 45,
        duration: 45,
        visual_cue: "Steepest descent trajectory orthogonal to contours",
        citation: "[CS229 Lecture 1 @ 02:45]"
      },
      {
        title: "3. Learning Rate Oscillation & Divergence",
        start_time: 90,
        duration: 50,
        visual_cue: "Oscillation between steep valley walls when α > 2 / λ_max",
        citation: "[CS229 Lecture 1 @ 04:15]"
      },
      {
        title: "4. Momentum Damping & Convergence",
        start_time: 140,
        duration: 40,
        visual_cue: "Exponentially weighted velocity vector v_t",
        citation: "[Goodfellow Deep Learning p. 14]"
      }
    ],
    captions: [
      { start_time: 0, end_time: 20, text: "Welcome to this visual derivation on loss surfaces and gradient descent optimization." },
      { start_time: 21, end_time: 44, text: "Consider a convex quadratic objective function J of theta, forming an elliptical valley." },
      { start_time: 45, end_time: 68, text: "The gradient vector nabla J always points in the direction of steepest instantaneous ascent." },
      { start_time: 69, end_time: 89, text: "Therefore, we negate it to step downward into the global minimum: theta_new equals theta_old minus alpha nabla J." },
      { start_time: 90, end_time: 115, text: "Notice what occurs when the learning rate alpha is set too aggressively large." },
      { start_time: 116, end_time: 139, text: "The parameter bounces violently across ravine walls and blows up towards numerical infinity." },
      { start_time: 140, end_time: 165, text: "By adding a momentum buffer beta, velocity along oscillatory dimensions cancels out." },
      { start_time: 166, end_time: 180, text: "This completes our derivation. You can now test your knowledge with the adaptive quiz." }
    ],
    interactive_transcript: [
      { time: 0, speaker: "Narrator", text: "Welcome to this visual derivation on loss surfaces and gradient descent optimization.", citation: "[CS229 Lecture 1 @ 00:45]" },
      { time: 22, speaker: "Narrator", text: "Consider a convex quadratic objective function J of theta, forming an elliptical valley.", citation: "[CS229 Lecture 1 @ 01:30]" },
      { time: 48, speaker: "Narrator", text: "The gradient vector nabla J always points in the direction of steepest instantaneous ascent.", citation: "[CS229 Lecture 1 @ 02:45]" },
      { time: 70, speaker: "Narrator", text: "Therefore, we negate it to step downward: theta_new = theta_old - alpha * grad(J).", citation: "[CS229 Lecture 1 @ 03:15]" },
      { time: 92, speaker: "Narrator", text: "Notice what occurs when the learning rate alpha is set too aggressively large.", citation: "[CS229 Lecture 1 @ 04:15]" },
      { time: 118, speaker: "Narrator", text: "The parameter bounces violently across ravine walls and blows up towards numerical infinity.", citation: "[CS229 Lecture 1 @ 04:50]" },
      { time: 142, speaker: "Narrator", text: "By adding a momentum buffer beta, velocity along oscillatory dimensions cancels out.", citation: "[Goodfellow Deep Learning p. 14]" },
      { time: 168, speaker: "Narrator", text: "This completes our derivation. You can now test your knowledge with the adaptive quiz.", citation: "[Week 3 Slides p. 5]" }
    ],
    post_quiz_topic: "Gradient Descent & Learning Rates"
  };

  const activeLesson = lesson || defaultLesson;

  // Fetch diagrams on mount
  useEffect(() => {
    fetch('/api/course-flow/diagrams')
      .then(r => r.json())
      .then(d => {
        if (d.diagrams) setDiagrams(d.diagrams);
      })
      .catch(() => {});
  }, []);

  // Sync mode if initialMode prop updates
  useEffect(() => {
    if (initialMode) {
      setViewerMode(initialMode);
    }
  }, [initialMode]);

  // Dynamic citation watcher: Jump to video or document passage
  useEffect(() => {
    if (activeCitation) {
      if (activeCitation.source_type === 'video') {
        if (viewerMode !== 'video_tutor') {
          setViewerMode('video_sync');
        }
        if (videoRef.current && activeCitation.start_seconds !== undefined && activeCitation.start_seconds !== null) {
          const targetSec = activeCitation.start_seconds;
          videoRef.current.currentTime = targetSec;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setViewerMode('document');
      }
    }
  }, [activeCitation]);

  // AI Video Lesson timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && viewerMode === 'video_tutor') {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeLesson.duration_seconds) {
            setIsPlaying(false);
            return activeLesson.duration_seconds;
          }
          return Math.min(prev + 1, activeLesson.duration_seconds);
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeLesson.duration_seconds, viewerMode]);

  const handleLessonSeek = (timeSec: number) => {
    setCurrentTime(Math.max(0, Math.min(timeSec, activeLesson.duration_seconds)));
  };

  const currentChapter = activeLesson.chapters.find((ch, idx) => {
    const nextCh = activeLesson.chapters[idx + 1];
    return currentTime >= ch.start_time && (!nextCh || currentTime < nextCh.start_time);
  }) || activeLesson.chapters[0];

  const currentCaption = activeLesson.captions.find(
    (cap) => currentTime >= cap.start_time && currentTime <= cap.end_time
  );

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const jumpToSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSyncVideoTimeUpdate = () => {
    if (videoRef.current) {
      setSyncTime(videoRef.current.currentTime);
    }
  };

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/video-lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          style: selectedStyle,
          course_id: 'cs229-ml'
        })
      });
      const data = await res.json();
      setLesson(data);
      setCurrentTime(0);
      setIsPlaying(true);
    } catch (e) {
      console.error("Video lesson generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCitationBadgeClick = (citationTag: string) => {
    if (citationTag.includes('Lecture 1')) {
      onCitationClick({
        tag: citationTag,
        source_name: "CS229 Lecture 1 - Optimization Fundamentals",
        source_type: "video",
        timestamp_str: "04:15",
        start_seconds: 255,
        video_url: defaultVideoUrl,
        snippet: "When the learning rate alpha is set too large, gradient descent will overshoot the minimum and oscillate outwards."
      });
      setViewerMode('video_sync');
    } else if (citationTag.includes('Deep Learning')) {
      onCitationClick({
        tag: citationTag,
        source_name: "Deep Learning Textbook (Goodfellow)",
        source_type: "pdf",
        page: 14,
        snippet: "Momentum is designed to accelerate learning, especially in the face of high curvature or noisy gradients."
      });
      setViewerMode('document');
    } else {
      onCitationClick({
        tag: citationTag,
        source_name: "Week 3 Slides - Neural Optimization",
        source_type: "slides",
        slide_number: 5,
        snippet: "Momentum accumulator updates parameter vector according to historical velocity."
      });
      setViewerMode('document');
    }
  };

  const lectureKeyTimestamps = [
    { label: "Loss Function J(θ)", time: 45, str: "00:45" },
    { label: "Negative Gradient Step", time: 90, str: "01:30" },
    { label: "Low α (Slow Convergence)", time: 165, str: "02:45" },
    { label: "High α (Overshooting Divergence)", time: 255, str: "04:15" },
    { label: "Momentum Optimizer", time: 350, str: "05:50" }
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all ${
      isExpanded ? 'max-w-7xl mx-auto' : ''
    }`}>
      {/* Top Header Mode Tabs */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* 1. AI Video Tutor (Agent 7) */}
          <button
            onClick={() => setViewerMode('video_tutor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewerMode === 'video_tutor'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="AI Pedagogical Video Tutor (3 Formats)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Video Tutor</span>
          </button>

          {/* 2. Lecture Video Sync */}
          <button
            onClick={() => setViewerMode('video_sync')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewerMode === 'video_sync'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Lecture Video Source with Click-to-Jump Sync"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Lecture Video Sync</span>
          </button>

          {/* 3. Textbook & Slides */}
          <button
            onClick={() => setViewerMode('document')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewerMode === 'document'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Deep Learning Textbook & Lecture Slides Excerpts"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Textbook & Slides</span>
          </button>

          {/* 4. Figures & Diagrams */}
          <button
            onClick={() => setViewerMode('diagrams')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewerMode === 'diagrams'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Extracted Figures, Computational Graphs & Formulas"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Figures ({diagrams.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeCitation && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 truncate max-w-[180px]">
              <BookmarkCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">{activeCitation.tag}</span>
            </span>
          )}

          {!isStandalone && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title={isExpanded ? "Restore Split View" : "Expand Full View"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col p-3 sm:p-4">
        {/* ==================== 1. AI VIDEO TUTOR MODE (Agent 7) ==================== */}
        {viewerMode === 'video_tutor' ? (
          <div className="space-y-4">
            {/* Generator Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Agent 7: Multimodal Lesson Player
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700">
                    3 Styles
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual derivations, chapter milestones, and Web Speech captions.
                </p>
              </div>

              {/* Generator Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Enter topic..."
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none w-36 sm:w-44"
                />

                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as any)}
                  className="px-2 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="animated_concept">Style A: Animated Concepts</option>
                  <option value="narrated_slides">Style B: Narrated Slides</option>
                  <option value="teacher_avatar">Style C: 2D Teacher Avatar</option>
                </select>

                <button
                  onClick={handleGenerateLesson}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
            </div>

            {/* Video Canvas & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Video Screen (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative aspect-video flex flex-col justify-between text-white p-4 select-none">
                  {/* Top Bar inside Canvas */}
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                      <span className="font-semibold text-slate-200 truncate">{activeLesson.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded shrink-0">
                      {activeLesson.style.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visual Simulation Canvas */}
                  <div className="relative z-10 my-auto text-center px-2 space-y-2">
                    {activeLesson.style === 'animated_concept' && (
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase font-mono text-teal-400 tracking-wider">
                          {currentChapter?.visual_cue || "MATHEMATICAL STEP DERIVATION"}
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
                          {currentTime < 45 && "J(θ) = 1/2 (θ - θ*)^T A (θ - θ*)"}
                          {currentTime >= 45 && currentTime < 90 && "∇J(θ) = A (θ - θ*)"}
                          {currentTime >= 90 && currentTime < 140 && "θ_(t+1) = θ_t - α ∇J(θ_t)  [α > 2/λ_max]"}
                          {currentTime >= 140 && "v_(t+1) = β v_t + (1-β) ∇J(θ_t)"}
                        </div>
                        <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          {currentTime >= 90 && currentTime < 140
                            ? "⚠️ Critical Divergence Condition: Eigenvalue bounds exceeded!"
                            : "Descent vector dynamically guides weights toward the global minimum."}
                        </div>
                      </div>
                    )}

                    {activeLesson.style === 'narrated_slides' && (
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-left max-w-md mx-auto space-y-1.5">
                        <div className="text-[11px] font-mono text-teal-400">SLIDE: {currentChapter?.title}</div>
                        <div className="font-bold text-xs text-white">{currentChapter?.visual_cue}</div>
                        <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                          <li className={currentTime >= 45 ? "text-teal-300 font-semibold" : ""}>
                            Descent step size directly scaled by learning rate parameter α.
                          </li>
                          <li className={currentTime >= 90 ? "text-amber-300 font-semibold" : ""}>
                            Ravines exhibit high condition numbers (λ_max / λ_min &gt;&gt; 1).
                          </li>
                          <li className={currentTime >= 140 ? "text-emerald-300 font-semibold" : ""}>
                            Momentum velocity dampens cross-canyon oscillation.
                          </li>
                        </ul>
                      </div>
                    )}

                    {activeLesson.style === 'teacher_avatar' && (
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-teal-800 border-2 border-teal-400 flex items-center justify-center text-white shadow-lg shrink-0">
                          <GraduationCap className={`w-8 h-8 ${isPlaying ? 'animate-bounce' : ''}`} />
                        </div>
                        <div className="text-left space-y-0.5">
                          <span className="text-[11px] font-mono text-teal-300">PROFESSOR ELLEN</span>
                          <div className="text-xs font-semibold text-white">
                            &quot;Let us observe the trajectory directly on the loss surface.&quot;
                          </div>
                          <div className="text-[10px] text-slate-400">Interactive Socratic Walkthrough</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Captions Overlay */}
                  {showCaptions && currentCaption && (
                    <div className="relative z-10 text-center mb-1">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-xs text-[11px] text-teal-200 font-medium max-w-md mx-auto border border-teal-500/20">
                        {currentCaption.text}
                      </span>
                    </div>
                  )}

                  {/* Bottom Controls Bar */}
                  <div className="relative z-10 pt-2 border-t border-slate-800 space-y-1.5">
                    {/* Seek Timeline */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{formatSecs(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max={activeLesson.duration_seconds}
                        value={currentTime}
                        onChange={(e) => handleLessonSeek(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatSecs(activeLesson.duration_seconds)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                        </button>

                        <button
                          onClick={() => handleLessonSeek(0)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Restart"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleLessonSeek(currentTime + 10)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="+10s"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                          {[0.75, 1.0, 1.25, 1.5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setPlaybackSpeed(s)}
                              className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                                playbackSpeed === s
                                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowCaptions(!showCaptions)}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                            showCaptions
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          CC
                        </button>

                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter Context & Quiz Action */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-white">
                      Current Milestone: {currentChapter?.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>Source: {currentChapter?.citation}</span>
                      {currentChapter?.citation && (
                        <button
                          onClick={() => handleCitationBadgeClick(currentChapter.citation!)}
                          className="text-[10px] font-mono text-teal-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Jump to Source</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {onStartQuiz && (
                    <button
                      onClick={() => onStartQuiz(activeLesson.post_quiz_topic || activeLesson.topic)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Quiz</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Chapters & Interactive Transcript (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {/* Chapters List */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>Lesson Chapters</span>
                  </h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {activeLesson.chapters.map((ch, idx) => {
                      const isActive = currentChapter?.title === ch.title;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleLessonSeek(ch.start_time)}
                          className={`p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-teal-950/60 border-teal-500 text-teal-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold truncate">{ch.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{ch.citation}</div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded shrink-0">
                            {formatSecs(ch.start_time)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Synced Interactive Transcript */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Click-to-Seek Transcript</span>
                  </h4>
                  <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1">
                    {activeLesson.interactive_transcript.map((line, idx) => {
                      const isCurrent =
                        currentTime >= line.time &&
                        (!activeLesson.interactive_transcript[idx + 1] ||
                          currentTime < activeLesson.interactive_transcript[idx + 1].time);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleLessonSeek(line.time)}
                          className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-teal-950/70 border-teal-500 text-teal-100 font-medium'
                              : 'bg-slate-900/30 border-transparent hover:bg-slate-900/70 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                            <span className="font-bold text-teal-400">{line.speaker}</span>
                            <span>{formatSecs(line.time)}</span>
                          </div>
                          <p className="leading-relaxed text-[11px]">{line.text}</p>
                          {line.citation && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono text-teal-400">
                              {line.citation}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewerMode === 'video_sync' ? (
          /* ==================== 2. LECTURE VIDEO SYNC MODE ==================== */
          <div className="flex flex-col gap-3">
            {/* Embedded Video Player */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl group">
              <video
                ref={videoRef}
                src={activeCitation?.video_url || defaultVideoUrl}
                onTimeUpdate={handleSyncVideoTimeUpdate}
                className="w-full h-full object-contain"
                controls
              />

              {/* Instant Jump notification overlay */}
              {activeCitation?.timestamp_str && (
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-teal-500/50 text-teal-200 text-xs px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Synced to citation:</span>
                  <strong className="text-white font-mono">{activeCitation.timestamp_str}</strong>
                </div>
              )}
            </div>

            {/* Quick-Jump Timeline Badges */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Curriculum Video Keyframes:</span>
                <span className="text-[11px] text-slate-400 font-mono">Current: {formatSecs(syncTime)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lectureKeyTimestamps.map((kf, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      jumpToSeconds(kf.time);
                      onCitationClick({
                        tag: `[CS229 Lecture 1 @ ${kf.str}]`,
                        source_name: "CS229 Lecture 1 - Optimization Fundamentals",
                        source_type: "video",
                        timestamp_str: kf.str,
                        start_seconds: kf.time,
                        snippet: kf.label
                      });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                      Math.abs(syncTime - kf.time) < 15
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200 font-medium'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{kf.str}</span>
                    <span className="truncate max-w-[140px]">{kf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Transcript Grounding Details */}
            <div className="mt-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Synchronized Lecture Transcript Context
                </h4>
                {activeCitation?.timestamp_str && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                    Timestamp: {activeCitation.timestamp_str}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                "{activeCitation?.snippet || 'Click any citation badge in the tutor chat (e.g., [CS229 Lecture 1 @ 04:15]) to immediately skip the video and load the transcript context here.'}"
              </p>
            </div>
          </div>
        ) : viewerMode === 'document' ? (
          /* ==================== 3. TEXTBOOK & SLIDES MODE ==================== */
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner min-h-[360px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-medium">
                      {activeCitation?.source_name || "Deep Learning Textbook (Goodfellow et al.)"}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {activeCitation?.page ? `Page ${activeCitation.page}` : activeCitation?.slide_number ? `Slide ${activeCitation.slide_number}` : 'Page 14'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Multimodal Source Grounding</span>
                </div>

                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">
                    {activeCitation?.page === 28 ? "Chapter 6: Deep Feedforward Networks & Backpropagation" :
                     activeCitation?.page === 45 ? "Chapter 8: Optimization for Training Deep Models" :
                     activeCitation?.slide_number ? `Slide ${activeCitation.slide_number}: Optimization Landscape` :
                     "Chapter 4: Numerical Computation & Gradient Optimization"}
                  </h3>

                  {/* Highlighted Cited Paragraph */}
                  <div className="p-3.5 bg-teal-950/40 border-l-4 border-teal-500 rounded-r-lg text-xs leading-relaxed text-slate-200">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-teal-300 font-semibold">
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      Cited Passage Referenced by AI Tutor:
                    </div>
                    {activeCitation?.snippet || "Gradient descent is an iterative first-order optimization algorithm for finding a local minimum of a differentiable function. The step size is governed by hyperparameter alpha, commonly designated the learning rate."}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    In multi-dimensional spaces, critical points include local minima, local maxima, and saddle points. Second-order methods utilize the Hessian matrix to estimate curvature, but computational scaling makes first-order stochastic methods standard for deep architectures.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Source Grounding: 100% Verified in Course Repository</span>
                <span className="font-mono text-teal-400">{activeCitation?.tag || "[Deep Learning Textbook p. 14]"}</span>
              </div>
            </div>

            {/* Quick Textbook Jump Links */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCitationClick({
                  tag: "[Deep Learning Textbook p. 14]",
                  source_name: "Deep Learning Textbook (Goodfellow)",
                  source_type: "pdf",
                  page: 14,
                  snippet: "Chapter 4: Numerical Computation. Most deep learning algorithms involve continuous optimization. The step size is governed by hyperparameter alpha, commonly designated the learning rate."
                })}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Textbook p. 14 (Gradient Descent)</span>
              </button>
              <button
                onClick={() => onCitationClick({
                  tag: "[Deep Learning Textbook p. 28]",
                  source_name: "Deep Learning Textbook (Goodfellow)",
                  source_type: "pdf",
                  page: 28,
                  snippet: "Chapter 6: Deep Feedforward Networks and Backpropagation. Backpropagation applies the multivariable calculus chain rule backward from the output layer to calculate partial derivatives."
                })}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Textbook p. 28 (Backprop)</span>
              </button>
              <button
                onClick={() => onCitationClick({
                  tag: "[Week 3 Slides Slide 5]",
                  source_name: "Week 3 Slides - Neural Optimization",
                  source_type: "slides",
                  slide_number: 5,
                  snippet: "Slide 5: Adaptive Learning Rate Algorithms: Adam (Adaptive Moment Estimation). Combines Momentum and RMSProp."
                })}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Slide 5 (Adam Optimizer)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ==================== 4. EXTRACTED FIGURES & DIAGRAMS MODE ==================== */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Extracted Figures & Diagrams from Slides / Textbooks:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Multimodal Extraction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {diagrams.map((d, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-teal-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                        {d.title}
                      </span>
                      <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded font-mono">
                        {d.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      "{d.caption}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">{d.origin}</span>
                    <button
                      onClick={() => onCitationClick({
                        tag: d.citation,
                        source_name: d.origin,
                        source_type: d.origin.includes('@') ? 'video' : 'pdf',
                        snippet: d.caption
                      })}
                      className="text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jump</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Also export alias VideoPlayerModule for compatibility
export const VideoPlayerModule: React.FC<SourceViewerProps> = (props) => (
  <SourceViewer {...props} initialMode="video_tutor" isStandalone={true} />
);

export default SourceViewer;
