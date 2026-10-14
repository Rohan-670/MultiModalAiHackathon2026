import React from 'react';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Layers,
  CheckCircle2,
  Compass,
  FileText,
  Target,
  Edit3
} from 'lucide-react';
import type { Language, LearnerProfile, UserProfile } from '../types';
import { getTranslation } from '../i18n';

interface StudentDashboardProps {
  user: UserProfile | null;
  learnerProfile: LearnerProfile | null;
  language?: Language;
  onNavigateTab: (tab: any) => void;
  onAskConcept: (concept: string) => void;
  onPracticeConcept: (concept: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  learnerProfile,
  language = 'English',
  onNavigateTab,
  onAskConcept,
  onPracticeConcept
}) => {
  const t = getTranslation(language);
  const studentName = user?.full_name || learnerProfile?.student_name || 'Alex Chen';
  const masteryPct = learnerProfile?.average_mastery_pct ?? 54.8;
  const masteredCount = learnerProfile?.mastered_count ?? 3;
  const gapCount = learnerProfile?.knowledge_gap_count ?? 2;

  // Weak topics identified for review
  const weakTopics = [
    {
      concept: 'Learning Rate Tuning',
      mastery: 35,
      urgency: 'Critical',
      reason: 'Student struggled in gradient descent derivation.'
    },
    {
      concept: 'Momentum Acceleration',
      mastery: 48,
      urgency: 'Moderate',
      reason: 'Missed numerical decay factor step derivation in last practice attempt.'
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
            <span>{t.tabQuiz} • {t.heroBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.welcomeBack}, {studentName}
          </h1>

          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            {t.dashboardSub}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('quiz')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-all shadow-md cursor-pointer"
            >
              <Target className="w-4 h-4 text-teal-700" />
              <span>{t.launchQuiz}</span>
            </button>

            <button
              onClick={() => onNavigateTab('personalize')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/40 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-300" />
              <span>{t.tabPersonalize}</span>
            </button>

            <button
              onClick={() => onNavigateTab('notes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/40 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>{t.uploadNotesBtn}</span>
            </button>

            <button
              onClick={() => onNavigateTab('chat')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/40 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-300" />
              <span>{t.askTutorBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mastery Probability Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.courseMastery}</span>
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
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.masteredConcepts}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{masteredCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Foundational principles verified</p>
          </div>
          <button
            onClick={() => onNavigateTab('learner')}
            className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewBreakdown}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Knowledge Gaps */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.knowledgeGaps}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{gapCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Concepts needing practice</p>
          </div>
          <button
            onClick={() => onNavigateTab('report')}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Gap Report</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Revision Mode Quick Link */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.tabRevision}</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">Active</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Flashcards with visual graphs</p>
          </div>
          <button
            onClick={() => onNavigateTab('revision')}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.tabRevision}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Priority Topics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t.weakTopicsTitle}</span>
            </h2>
            <button
              onClick={() => onNavigateTab('flow')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t.tabFlow}</span>
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
                    {t.masteryLabel}: {item.mastery}%
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => onAskConcept(item.concept)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    {t.askTutorBtn}
                  </button>
                  <button
                    onClick={() => onPracticeConcept(item.concept)}
                    className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{t.launchQuiz}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Actions & Personalize */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Quick Study Hub</span>
          </h2>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <button
              onClick={() => onNavigateTab('personalize')}
              className="w-full p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-left hover:border-teal-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200">{t.tabPersonalize}</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-1">
                Add and delete notes, generate quizzes on demand
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('revision')}
              className="w-full p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">{t.tabRevision}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-1">
                Visual flashcards with diagrams & graphs
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('video')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left hover:border-slate-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.tabVideo}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Narrated voiceover lessons with slide sync
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
