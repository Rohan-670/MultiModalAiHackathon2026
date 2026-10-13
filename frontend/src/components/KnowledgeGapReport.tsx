import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, AlertTriangle, Video, BookOpen, ArrowRight, RefreshCw } from 'lucide-react';
import type { KnowledgeGapReportData, Citation } from '../types';

interface KnowledgeGapReportProps {
  onCitationClick: (cit: Citation) => void;
  onNavigateToQuiz: () => void;
}

export const KnowledgeGapReport: React.FC<KnowledgeGapReportProps> = ({
  onCitationClick,
  onNavigateToQuiz,
}) => {
  const [report, setReport] = useState<KnowledgeGapReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gap-report');
      const data: KnowledgeGapReportData = await res.json();
      setReport(data);
    } catch (e) {
      console.error("Failed to load gap report", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Automated Knowledge Gap Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-of-session diagnostic synthesizing mastered concepts vs priority knowledge gaps with 1-click bookmarks to exact video timestamps and textbook pages.
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 animate-pulse">
          Generating personalized learning analytics and bookmarking curriculum timestamps...
        </div>
      ) : !report ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          No assessment history found. Take a quiz to generate your diagnostic report!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base font-mono">
                {report.total_questions}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Completed</p>
                <h4 className="text-xs sm:text-sm font-bold text-white">Questions</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-base font-mono">
                {report.accuracy_percentage}%
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Accuracy</p>
                <h4 className="text-xs sm:text-sm font-bold text-white">Success Rate</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-base font-mono">
                {report.bkt_profile ? `${report.bkt_profile.average_mastery_pct}%` : "55%"}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">BKT Model</p>
                <h4 className="text-xs sm:text-sm font-bold text-white">Avg Mastery</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base font-mono">
                {report.knowledge_gaps.length}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Review Targets</p>
                <h4 className="text-xs sm:text-sm font-bold text-white">Identified Gaps</h4>
              </div>
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Curriculum Mastery Summary:
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {report.summary_narrative}
            </p>
          </div>

          {/* Mastered Concepts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified Mastered Concepts ({report.mastered_concepts.length})
            </h3>
            {report.mastered_concepts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No mastered concepts recorded yet. Keep practicing!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.mastered_concepts.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-emerald-200">{item.concept}</span>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Mastered ({item.correct_count}x)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Knowledge Gaps & Direct Click-to-Jump Bookmarks */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Priority Knowledge Gaps & Revision Bookmarks ({report.knowledge_gaps.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click bookmark to jump video/document</span>
            </div>

            {report.knowledge_gaps.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                🎉 No critical knowledge gaps detected! You are currently on track for full curriculum mastery.
              </div>
            ) : (
              <div className="space-y-3">
                {report.knowledge_gaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{gap.concept}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                          {gap.priority} Priority
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Missed: {gap.missed_count} times</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Recommended Review Bookmarks (Click-to-Jump):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {gap.jump_bookmarks.map((bm, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              onCitationClick({
                                tag: bm.tag,
                                source_name: bm.source_name,
                                source_type: bm.source_type as any,
                                timestamp_str: bm.timestamp_str,
                                start_seconds: bm.seconds,
                                page: bm.page,
                                snippet: `Review target identified in Knowledge Gap Report for ${gap.concept}.`
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            {bm.source_type === 'video' ? (
                              <Video className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span className="font-mono text-cyan-300">
                              {bm.timestamp_str ? `@ ${bm.timestamp_str}` : `p. ${bm.page}`}
                            </span>
                            <span className="font-medium truncate max-w-[120px]">{bm.source_name}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onNavigateToQuiz}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Practice Weak Areas in Quiz Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
