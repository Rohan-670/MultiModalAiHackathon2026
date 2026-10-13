import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import type { LearnerProfile } from '../types';

interface LearnerModelViewProps {
  onStartQuizOnConcept: (concept: string) => void;
  onRefreshProfile?: () => void;
}

export const LearnerModelView: React.FC<LearnerModelViewProps> = ({
  onStartQuizOnConcept,
  onRefreshProfile
}) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [intakeModalOpen, setIntakeModalOpen] = useState<boolean>(false);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<number, boolean>>({});
  const [intakeSubmitted, setIntakeSubmitted] = useState<boolean>(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learner/profile');
      const data: LearnerProfile = await res.json();
      setProfile(data);
    } catch (e) {
      console.error("Failed to load learner profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const intakeQuestions = [
    {
      id: 1,
      concept: "Loss Function & Optimization",
      question: "In supervised learning, what is the fundamental purpose of empirical risk minimization?",
      options: ["To find model parameters that minimize error on training data", "To invert the dataset matrix directly without gradients"],
      correctIndex: 0
    },
    {
      id: 2,
      concept: "Gradient Descent Step",
      question: "Why does gradient descent take a step in the direction of the NEGATIVE gradient?",
      options: ["Because the negative gradient points in the direction of greatest decrease of loss", "Because negative numbers train faster on GPUs"],
      correctIndex: 0
    },
    {
      id: 3,
      concept: "Momentum in Ravines",
      question: "What primary benefit does Polyak Momentum provide in ill-conditioned ravines?",
      options: ["It accumulates an exponential moving average of past gradients to cancel perpendicular oscillations", "It replaces gradient descent with linear regression"],
      correctIndex: 0
    }
  ];

  const handleCompleteIntake = async () => {
    const payload = intakeQuestions.map((q, idx) => ({
      concept: q.concept,
      is_correct: intakeAnswers[idx] === true
    }));

    try {
      await fetch('/api/learner/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload })
      });
      setIntakeSubmitted(true);
      fetchProfile();
      onRefreshProfile?.();
      setTimeout(() => {
        setIntakeModalOpen(false);
        setIntakeSubmitted(false);
      }, 1500);
    } catch (e) {
      console.error("Intake failed", e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Learner Model: Bayesian Knowledge Tracing (BKT)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic probability tracking of per-topic mastery updated after every quiz and conversation, coupled with Ebbinghaus forgetting curves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIntakeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Student Intake Diagnostic</span>
          </button>
          <button
            onClick={fetchProfile}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors cursor-pointer"
            title="Refresh BKT metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 animate-pulse">
          Computing Bayesian Knowledge Tracing posteriors and Ebbinghaus memory retrievability...
        </div>
      ) : !profile ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          No learner profile data available.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono font-bold text-base">
                {profile.average_mastery_pct}%
              </div>
              <div>
                <p className="text-[11px] text-slate-400">BKT Overall</p>
                <h4 className="text-sm font-bold text-white">Average Mastery</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-base">
                {profile.mastered_count}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Mastery ≥ 75%</p>
                <h4 className="text-sm font-bold text-white">Mastered Concepts</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-base">
                {profile.knowledge_gap_count}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Mastery &lt; 40%</p>
                <h4 className="text-sm font-bold text-white">Priority Gaps</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-base">
                {profile.total_concepts_tracked}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Curriculum Scope</p>
                <h4 className="text-sm font-bold text-white">Tracked Concepts</h4>
              </div>
            </div>
          </div>

          {/* Concepts Mastery Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Concept-Level Bayesian Knowledge Tracing Estimates
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Formula: P(L_t) = Posterior + (1 - Posterior) * P(T)
              </span>
            </div>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              {profile.concepts.map((c, i) => {
                const isMastered = c.status === 'Mastered';
                const isGap = c.status === 'Knowledge Gap';

                return (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    {/* Concept Name & Status */}
                    <div className="min-w-[200px]">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{c.concept}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                            isMastered
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isGap
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Attempts: {c.attempts} ({c.correct} correct)
                        </span>
                      </div>
                    </div>

                    {/* Mastery Bar */}
                    <div className="flex-1 max-w-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Mastery Probability:</span>
                        <span className="font-mono font-bold text-indigo-300">
                          {c.mastery_percentage}% (P={c.mastery_probability})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMastered ? 'bg-emerald-500' : isGap ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(c.mastery_percentage, 5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Spaced Repetition Retrievability */}
                    <div className="text-right min-w-[110px]">
                      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Retrievability:</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {c.retrievability}%
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => onStartQuizOnConcept(c.concept)}
                      className="px-3 py-1 bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Practice
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Model Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Standard BKT Mathematical Model Parameters:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">P(L₀) Initial Prior</span>
                <p className="font-bold text-white font-mono">0.20 (20%)</p>
                <p className="text-[10px] text-slate-500">Initial probability before practice</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">P(T) Transition</span>
                <p className="font-bold text-white font-mono">0.15 (15%)</p>
                <p className="text-[10px] text-slate-500">Learning rate step per practice</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">P(G) Guessing</span>
                <p className="font-bold text-white font-mono">0.20 (20%)</p>
                <p className="text-[10px] text-slate-500">Correct answer by chance</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">P(S) Slipping</span>
                <p className="font-bold text-white font-mono">0.10 (10%)</p>
                <p className="text-[10px] text-slate-500">Accidental mistake despite mastery</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Intake Modal */}
      {intakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Diagnostic Placement Intake</h3>
              </div>
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Answer these 3 quick conceptual questions to calibrate your personalized Bayesian mastery priors:
            </p>

            <div className="space-y-4">
              {intakeQuestions.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-white">{idx + 1}. {q.question}</h4>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setIntakeAnswers(prev => ({ ...prev, [idx]: oIdx === q.correctIndex }))}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                          intakeAnswers[idx] === (oIdx === q.correctIndex)
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteIntake}
                disabled={intakeSubmitted}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                {intakeSubmitted ? "Calibrating..." : "Calibrate Bayesian Priors"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
