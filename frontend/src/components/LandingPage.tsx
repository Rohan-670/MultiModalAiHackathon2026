import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Play,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../i18n';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onOpenAuth: () => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onGetStarted,
  onOpenAuth,
  onQuickDemo
}) => {
  const t = getTranslation(language);
  const [activeVideoStyle, setActiveVideoStyle] = useState<'animated_concept' | 'narrated_slides' | 'teacher_avatar'>('animated_concept');

  return (
    <div className="w-full flex flex-col min-h-screen text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-16 md:pb-20 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-teal-50/50 via-white to-stone-50 dark:from-[#202725] dark:via-[#26312D] dark:to-[#202725]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
            {/* Academic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-600/30 dark:border-teal-400/30 bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.heroBadge}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t.heroTitle1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-300 dark:via-teal-400 dark:to-emerald-300">
                {t.heroTitle2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t.heroDesc}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-md shadow-teal-700/20 hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.getStarted}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onQuickDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
              >
                <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t.exploreDemo}</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-xs sm:text-sm"
              >
                <span>{t.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Bar */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 w-full text-left">
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                <div className="text-teal-700 dark:text-teal-400 font-mono text-xl sm:text-2xl font-bold">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.fidelityStat}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-xl sm:text-2xl font-bold">Instant</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.instantPointsStat}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                <div className="text-teal-700 dark:text-teal-400 font-mono text-xl sm:text-2xl font-bold">Voiceover</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.voiceoverStat}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                <div className="text-indigo-600 dark:text-indigo-400 font-mono text-xl sm:text-2xl font-bold">Visual</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.studyCardsStat}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Video Tutor Preview Section */}
      <section className="py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#252E2B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.tabVideo}
            </h2>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveVideoStyle('animated_concept')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'animated_concept'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Concept Animation
              </button>
              <button
                onClick={() => setActiveVideoStyle('narrated_slides')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'narrated_slides'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Narrated Slides
              </button>
              <button
                onClick={() => setActiveVideoStyle('teacher_avatar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeVideoStyle === 'teacher_avatar'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Teacher Voice
              </button>
            </div>
          </div>

          {/* Active Style Preview Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6">
            <div className="lg:col-span-7 aspect-video rounded-xl bg-slate-900 text-white overflow-hidden relative border border-slate-800 shadow-lg flex flex-col justify-between p-5">
              {activeVideoStyle === 'animated_concept' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>STEP DERIVATION</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">STEP 2 OF 4</span>
                  </div>
                  <div className="space-y-2.5 my-auto">
                    <div className="text-lg font-bold font-mono text-teal-400">
                      θ_(t+1) = θ_t - α ∇J(θ_t)
                    </div>
                    <p className="text-xs text-slate-300 max-w-md">
                      When learning rate α is optimal, the parameter step points down the steepest descent vector into the local valley without catastrophic oscillation.
                    </p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-2/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Gradient Vector Direction
                    </span>
                    <span className="font-mono text-teal-400">04:15</span>
                  </div>
                </>
              )}

              {activeVideoStyle === 'narrated_slides' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>SLIDE SYNCHRONIZATION</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">SLIDE 5</span>
                  </div>
                  <div className="space-y-2 my-auto">
                    <div className="text-base font-bold text-white">Loss Landscapes & Ravines</div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>Condition number determines curvature asymmetry</li>
                      <li>High curvature causes gradient vector oscillation</li>
                      <li>Momentum dampens high-frequency directional fluctuations</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Momentum Acceleration
                    </span>
                    <span className="font-mono text-teal-400">02:40</span>
                  </div>
                </>
              )}

              {activeVideoStyle === 'teacher_avatar' && (
                <>
                  <div className="flex items-center justify-between text-xs text-teal-300 font-mono">
                    <span>TEACHER TUTOR VOICEOVER</span>
                    <span className="bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-4 my-auto">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center shrink-0 border-2 border-teal-400 shadow-md">
                      <GraduationCap className="w-8 h-8 text-white animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-teal-300">Spoken Clarification</div>
                      <p className="text-xs text-slate-200 italic">
                        &quot;Notice how the learning rate controls step magnitude. Let&apos;s derive why.&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-teal-400" /> Socratic Clarification
                    </span>
                    <span className="font-mono text-teal-400">01:30</span>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeVideoStyle === 'animated_concept' && 'Animated Educational Concepts'}
                {activeVideoStyle === 'narrated_slides' && 'Narrated Slides with Visual Highlights'}
                {activeVideoStyle === 'teacher_avatar' && 'Voiceover Teacher Explanation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeVideoStyle === 'animated_concept' &&
                  'Transforms abstract equations and vectors into intuitive animated diagrams.'}
                {activeVideoStyle === 'narrated_slides' &&
                  'Synchronizes presentation slide bullet points with spoken voice narration.'}
                {activeVideoStyle === 'teacher_avatar' &&
                  'Simulates an engaging 1-on-1 tutoring session with clear explanations.'}
              </p>

              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <span>{t.appWorkspace}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-[#1C2321] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded-md bg-teal-700 flex items-center justify-center text-white">
              <GraduationCap className="w-3 h-3" />
            </div>
            <span>LearnSphere</span>
            <span className="text-slate-400 font-normal">| {t.tagline}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>{t.tabQuiz}</span>
            <span>{t.tabPersonalize}</span>
            <span>{t.tabNotes}</span>
            <span>{t.tabRevision}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
