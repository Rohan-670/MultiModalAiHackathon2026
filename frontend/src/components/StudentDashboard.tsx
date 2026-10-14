import React from 'react';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Calendar,
  Layers,
  CheckCircle2,
  Compass,
  FileText,
  Target
} from 'lucide-react';
import type { LearnerProfile, UserProfile } from '../types';

interface StudentDashboardProps {
  user: UserProfile | null;
  learnerProfile: LearnerProfile | null;
  onNavigateTab: (tab: any) => void;
  onAskConcept: (concept: string) => void;
  onPracticeConcept: (concept: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  learnerProfile,
  onNavigateTab,
  onAskConcept,
  onPracticeConcept
}) => {
  const studentName = user?.full_name || learnerProfile?.student_name || 'Alex Chen';
  const masteryPct = learnerProfile?.average_mastery_pct ?? 54.8;
  const masteredCount = learnerProfile?.mastered_count ?? 3;
  const gapCount = learnerProfile?.knowledge_gap_count ?? 2;

  // Weak topics identified by BKT engine
  const weakTopics = [
    {
      concept: 'Learning Rate Tuning',
      mastery: 35,
      urgency: 'Critical',
      reason: 'BKT slip probability high; student oscillated in gradient descent derivation.'
    },
    {
      concept: 'Momentum Acceleration',
      mastery: 48,
      urgency: 'Moderate',
      reason: 'Missed numerical decay factor step derivation in last quiz attempt.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Target Exam Prep: Adaptive Assessment & CBT Simulator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {studentName}
          </h1>

          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Generate custom tests on your exact syllabus requirements, practice chapter questions, and strengthen weak concepts with real-time analytics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('quiz')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-all shadow-md cursor-pointer"
            >
              <Target className="w-4 h-4 text-teal-700" />
              <span>Launch MARKS Custom Test</span>
            </button>

            <button
              onClick={() => onNavigateTab('notes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/40 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>Upload Notes / Syllabus</span>
            </button>

            <button
              onClick={() => onNavigateTab('chat')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/40 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-300" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mastery Probability Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Course Mastery (BKT)</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-teal-700 dark:text-teal-400">{masteryPct}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Updated after each assessment</span>
        </div>

        {/* Mastered Concepts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Mastered Concepts</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{masteredCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Loss functions, update rules</p>
          </div>
          <button
            onClick={() => onNavigateTab('learner')}
            className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View BKT Breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Knowledge Gaps */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Knowledge Gaps</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{gapCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Requiring active remediation</p>
          </div>
          <button
            onClick={() => onNavigateTab('report')}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Read Gap Report</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Course Sources Ingested */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ingested Course Media</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-teal-700 dark:text-teal-400">3</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Video, PDF book, PPTX slides</p>
          </div>
          <button
            onClick={() => onNavigateTab('library')}
            className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Library</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Actionable Weak Topics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Actionable Weak Topics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Recommended Interventions (Learner Model Evidence)</span>
            </h2>
            <button
              onClick={() => onNavigateTab('flow')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Prerequisites DAG</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {weakTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.concept}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        item.urgency === 'Critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.reason}</p>
                  <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold">
                    Current BKT Mastery: {item.mastery}%
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => onAskConcept(item.concept)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Ask Tutor
                  </button>
                  <button
                    onClick={() => onPracticeConcept(item.concept)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Spaced Review Schedule Box */}
          <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-xs">
                <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Today&apos;s Spaced Repetition Queue (Ebbinghaus Decay)</span>
              </div>
              <button
                onClick={() => onNavigateTab('revision')}
                className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                All Flashcards & Briefs →
              </button>
            </div>
            <p className="text-xs text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
              Target topic: <strong>Optimization Fundamentals & Gradient Update Rules</strong>.
              Estimated retrievability has fallen below 60%. Completing a 2-minute spoken brief today reinforces retention by 84%.
            </p>
          </div>
        </div>

        {/* Right 5 Columns: Quick Launchers & Recent Study Activity */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Learning Modules</span>
          </h2>

          <div className="space-y-2.5">
            <div
              onClick={() => onNavigateTab('video')}
              className="p-4 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/60 dark:hover:border-teal-400/60 shadow-xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Video Tutor (3 Styles)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Chapters, WebVTT captions & seekable transcript</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>

            <div
              onClick={() => onNavigateTab('chat')}
              className="p-4 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/60 dark:hover:border-teal-400/60 shadow-xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Socratic Tutor & Source Viewer</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Click-to-jump citations & 8 teaching styles</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>

            <div
              onClick={() => onNavigateTab('flow')}
              className="p-4 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/60 dark:hover:border-teal-400/60 shadow-xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Course Flow DAG</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Interactive prerequisite concept map</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>

            <div
              onClick={() => onNavigateTab('quiz')}
              className="p-4 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/60 dark:hover:border-teal-400/60 shadow-xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">NTA CBT Simulator & Notebook</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Full-screen CBT exam, question palette & bookmark notebook</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
