import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Play,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Layers,
  BookmarkCheck,
  Upload,
  MessageSquare,
  Sun
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenAuth,
  onQuickDemo
}) => {
  const [activeVideoStyle, setActiveVideoStyle] = useState<'animated_concept' | 'narrated_slides' | 'teacher_avatar'>('animated_concept');

  return (
    <div className="w-full flex flex-col min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-teal-50/50 via-white to-stone-50 dark:from-[#202725] dark:via-[#26312D] dark:to-[#202725]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            {/* Academic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-600/30 dark:border-teal-400/30 bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Open-Source Multimodal AI Tutoring & Adaptive Mastery</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Learn deeply.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-300 dark:via-teal-400 dark:to-emerald-300">
                Improve continuously.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Upload your lecture notes, PDFs, slides, or documents. LearnSphere AI instantly analyzes them to produce <strong>Important Points</strong>, <strong>Video Lessons with Spoken Voiceover</strong>, and <strong>Interactive Study Cards</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-md shadow-teal-700/20 hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload Notes & Start Learning</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onQuickDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer text-sm"
              >
                <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Explore Student Demo</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-sm"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-xs">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-mono text-2xl font-bold">
                  100%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notes-Grounded Fidelity</div>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-2xl font-bold">
                  Instant
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Important Points & Formulas</div>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-xs">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-mono text-2xl font-bold">
                  Voiceover
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Narrated Video Lessons</div>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-xs">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-2xl font-bold">
                  3D Cards
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Topic Flashcards Suite</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Video Tutor Formats Section */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#252E2B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Agent 7: Video Tutor Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Three Pedagogical Video Tutor Formats
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Cost-conscious local generation. No expensive proprietary video APIs required. Every lesson includes synchronized WebVTT captions, chapters, and clickable transcripts.
            </p>

            {/* Video Style Switcher */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-6 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveVideoStyle('animated_concept')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'animated_concept'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Style A: Animated Concepts
              </button>
              <button
                onClick={() => setActiveVideoStyle('narrated_slides')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'narrated_slides'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Style B: Narrated Slides
              </button>
              <button
                onClick={() => setActiveVideoStyle('teacher_avatar')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'teacher_avatar'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Style C: 2D Animated Teacher
              </button>
            </div>
          </div>

          {/* Active Style Preview Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8">
            <div className="lg:col-span-7 aspect-video rounded-xl bg-slate-900 text-white overflow-hidden relative border border-slate-800 shadow-lg flex flex-col justify-between p-6">
              {activeVideoStyle === 'animated_concept' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>CANVAS: MATHEMATICAL STEP DERIVATION</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">STEP 2 OF 4</span>
                  </div>
                  <div className="space-y-3 my-auto">
                    <div className="text-xl font-bold font-mono text-teal-400">
                      θ_(t+1) = θ_t - α ∇J(θ_t)
                    </div>
                    <p className="text-xs text-slate-300 max-w-md">
                      When learning rate α is optimal, the parameter step points straight down the steepest descent vector into the local valley without catastrophic oscillation.
                    </p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-2/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Chapter 2: Gradient Vector Direction
                    </span>
                    <span className="font-mono text-teal-400">[CS229 Lecture 1 @ 04:15]</span>
                  </div>
                </>
              )}

              {activeVideoStyle === 'narrated_slides' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>LECTURE SLIDE SYNCHRONIZATION</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">SLIDE 5</span>
                  </div>
                  <div className="space-y-2.5 my-auto">
                    <div className="text-lg font-bold text-white">Loss Landscapes & Ravines</div>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>Condition number determines curvature asymmetry</li>
                      <li>High curvature causes gradient vector oscillation perpendicular to valley</li>
                      <li>Momentum dampens high-frequency directional fluctuations</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Chapter 3: Momentum Acceleration
                    </span>
                    <span className="font-mono text-teal-400">[Week 3 Slides p. 5]</span>
                  </div>
                </>
              )}

              {activeVideoStyle === 'teacher_avatar' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>2D ANIMATED TUTOR AVATAR</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">DR. ELLEN</span>
                  </div>
                  <div className="flex items-center gap-4 my-auto">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center shrink-0 border-2 border-teal-400 shadow-md">
                      <GraduationCap className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold text-teal-300">Spoken Clarification</div>
                      <p className="text-xs text-slate-200 italic">
                        &quot;Notice how the learning rate controls step magnitude. Too large, and we fly off the surface entirely! Let&apos;s derive why.&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Socratic Clarification & Derivation
                    </span>
                    <span className="font-mono text-teal-400">[Goodfellow Textbook p. 14]</span>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeVideoStyle === 'animated_concept' && 'Style A: Animated Educational Concepts'}
                {activeVideoStyle === 'narrated_slides' && 'Style B: Narrated Slides with Visual Highlights'}
                {activeVideoStyle === 'teacher_avatar' && 'Style C: 2D Animated Teacher with Whiteboard'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeVideoStyle === 'animated_concept' &&
                  'Transforms abstract mathematical equations, vectors, and optimization contours into intuitive animated diagrams. Great for visual and spatial learners.'}
                {activeVideoStyle === 'narrated_slides' &&
                  'Synchronizes presentation slide deck bullet points with synchronized narration, bullet highlighting, and direct origin slide citations.'}
                {activeVideoStyle === 'teacher_avatar' &&
                  'Simulates an engaging 1-on-1 private tutoring session with an animated teacher persona who gestures, explains misconceptions, and writes step derivations.'}
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Interactive Click-to-Seek Transcript</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Playback speed options (0.75x to 2.0x)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Automatic Post-Lesson Diagnostic Assessment</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <span>Open Video Tutor in Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Study Features Grid */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-stone-50/60 dark:bg-[#202725]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Student Study Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Everything You Need to Master Your Course Notes
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Upload your lecture notes, PDFs, or slides. AI analyzes the content to produce important points, animated video lessons with voiceover, and interactive study flashcards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Upload Any Notes */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload Any Notes</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Drop your PDF textbooks, Word DOCX documents, PowerPoint slides, markdown summaries, or paste raw notes directly.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                PDF • DOCX • PPTX • TXT
              </div>
            </div>

            {/* Feature 2: Important Points */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Important Points & Summaries</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI extracts core concepts, definitions, mathematical formulas, and high-yield exam takeaways in clear, bulleted summaries.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                Key Takeaways & Formulas
              </div>
            </div>

            {/* Feature 3: Video Tutor with Voiceover */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Video Tutor with Voiceover</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Watch visual animated lessons with spoken voice narration, synchronized bullet highlights, and custom narration playback speed.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                Spoken Narration & Slides
              </div>
            </div>

            {/* Feature 4: Cards on Topic (Flashcards) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Cards on Topic</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Interactive 3D study flashcards generated directly from your notes. Flip cards, test recall, and track concepts you have mastered.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                Active Recall & Spaced Review
              </div>
            </div>

            {/* Feature 5: Ask Tutor with Citations */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask AI Tutor Directly</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ask questions about your uploaded materials. Get answers strictly grounded in your notes with clickable source citations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                Source-Grounded Answers
              </div>
            </div>

            {/* Feature 6: Working Dark Mode & Light Mode */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2A3430] border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Sun className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Working Dark & Light Mode</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Seamless one-click theme toggle with accessible color contrast and persistent selection for daytime and late-night studying.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-700 dark:text-teal-400">
                Comfortable Eye-Friendly Theming
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white dark:bg-[#1C2321] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <div className="w-6 h-6 rounded-md bg-teal-700 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span>LearnSphere AI</span>
            <span className="text-slate-400 font-normal">| Learn deeply. Improve continuously.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Open-Source First</span>
            <span>MIT License</span>
            <span>Privacy Preserved (Local SQLite DB)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
