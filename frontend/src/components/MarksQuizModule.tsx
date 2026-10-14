import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Bookmark,
  Award,
  Calculator,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Flame,
  Zap,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  Star,
  BarChart2,
  Send
} from 'lucide-react';
import type { QuizQuestion, Citation, QuestionType, ExamCurriculum, TestScorecard } from '../types';
import { MathRenderer } from './MathRenderer';

interface MarksQuizModuleProps {
  onCitationClick: (cit: Citation) => void;
  onNavigateToReport: () => void;
  onUpdateLearnerProfile?: () => void;
  initialTopic?: string;
}

export type QuizViewMode = 'create' | 'pyq_bank' | 'cbt_test' | 'practice' | 'scorecard' | 'notebook';

// Question status in CBT mode
export type QuestionStatus = 'unvisited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked';

export const MarksQuizModule: React.FC<MarksQuizModuleProps> = ({
  onCitationClick,
  onNavigateToReport,
  onUpdateLearnerProfile,
  initialTopic
}) => {
  // ---------------- Core App Navigation & State ----------------
  const [activeView, setActiveView] = useState<QuizViewMode>('create');
  const [targetExam, setTargetExam] = useState<string>('JEE Main');
  const availableExams = [
    { id: 'JEE Main', title: 'JEE Main 2026', description: 'Engineering entrance: Maths, Physics, Chemistry.' },
    { id: 'JEE Advanced', title: 'JEE Advanced', description: 'IIT entrance: multi-correct, integer numericals.' },
    { id: 'NEET UG', title: 'NEET UG', description: 'Medical entrance: Biology, Physics, Chemistry.' },
    { id: 'GATE CS & AI', title: 'GATE Computer Science & AI', description: 'Algorithms, systems, and AI foundations.' },
    { id: 'CS229 & AI/ML', title: 'Stanford CS229 / AI & Machine Learning', description: 'Optimization, neural backprop, and machine learning.' }
  ];
  const [curriculum, setCurriculum] = useState<ExamCurriculum | null>(null);

  // ---------------- Custom Test Generator Parameters ----------------
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'numerical']);
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [markingScheme, setMarkingScheme] = useState<string>('standard');
  const [testMode, setTestMode] = useState<'practice' | 'cbt'>('practice');

  // ---------------- USER REQUIREMENTS (Core Requirement) ----------------
  const [userRequirements, setUserRequirements] = useState<string>(
    initialTopic ? `Focus specifically on ${initialTopic} with tricky edge cases and numerical derivations.` : ''
  );

  // ---------------- Active Test State ----------------
  const [testTitle, setTestTitle] = useState<string>('Custom Adaptive Assessment');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(600);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);

  // CBT Question statuses and responses
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState<boolean>(false);

  // Practice Mode state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [multiSelectedOptions, setMultiSelectedOptions] = useState<number[]>([]);
  const [numericalValue, setNumericalValue] = useState<string>('');
  const [shortAnswerText, setShortAnswerText] = useState<string>('');
  const [practiceGraded, setPracticeGraded] = useState<boolean>(false);
  const [practiceResult, setPracticeResult] = useState<any>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [remedialQuestion, setRemedialQuestion] = useState<QuizQuestion | null>(null);
  const [remedialSelected, setRemedialSelected] = useState<number | null>(null);
  const [remedialGraded, setRemedialGraded] = useState<boolean>(false);

  // Scorecard / Analytics state
  const [scorecard, setScorecard] = useState<TestScorecard | null>(null);
  const [scorecardFilter, setScorecardFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted' | 'bookmarked'>('all');

  // Smart Notebook / Mistake Book state
  const [notebookQuestions, setNotebookQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('marks_smart_notebook');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save notebook persistence
  useEffect(() => {
    localStorage.setItem('marks_smart_notebook', JSON.stringify(notebookQuestions));
  }, [notebookQuestions]);

  // Fetch Curriculum when targetExam changes
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await fetch(`/api/quiz/curriculum?target_exam=${encodeURIComponent(targetExam)}`);
        const data = await res.json();
        setCurriculum(data);
        if (data.subjects && data.subjects.length > 0) {
          // Select all subjects and first 2 chapters by default
          setSelectedSubjects(data.subjects.map((s: any) => s.name));
          const allChaps: string[] = [];
          data.subjects.forEach((s: any) => {
            if (s.chapters && s.chapters.length > 0) {
              allChaps.push(s.chapters[0].name);
            }
          });
          setSelectedChapters(allChaps);
        }
      } catch (err) {
        console.error("Failed to fetch curriculum:", err);
      }
    };
    fetchCurriculum();
  }, [targetExam]);

  // Live Timer for CBT Mode
  useEffect(() => {
    if (!isTestActive || testMode !== 'cbt') return;

    const interval = setInterval(() => {
      setTimerSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmitTest();
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestActive, testMode]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Bookmark / Unbookmark question
  const toggleBookmark = (q: QuizQuestion) => {
    setNotebookQuestions(prev => {
      const exists = prev.some(item => item.id === q.id);
      if (exists) {
        return prev.filter(item => item.id !== q.id);
      } else {
        return [...prev, { ...q, is_bookmarked: true }];
      }
    });
  };

  const isBookmarked = (qId: string) => {
    return notebookQuestions.some(item => item.id === qId);
  };

  // ---------------- Generate Quiz based on User Requirements ----------------
  const handleGenerateTest = async (overrideParams?: any) => {
    setIsLoading(true);
    setScorecard(null);
    setPracticeGraded(false);
    setPracticeResult(null);
    setCurrentIdx(0);
    setUserAnswers({});
    setShowHint(false);

    const params = {
      target_exam: targetExam,
      subjects: selectedSubjects,
      chapters: selectedChapters.length > 0 ? selectedChapters : (selectedSubjects.length > 0 ? [selectedSubjects[0]] : ['Core']),
      topic: selectedChapters[0] || 'Optimization Fundamentals',
      question_type: questionTypes.length === 1 ? questionTypes[0] : 'mixed',
      question_types: questionTypes,
      difficulty,
      source_filter: sourceFilter,
      num_questions: numQuestions,
      user_requirements: userRequirements,
      time_limit_minutes: timeLimitMinutes,
      marking_scheme: markingScheme,
      ...overrideParams
    };

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setTestTitle(`${targetExam} Custom Test: ${selectedChapters[0] || 'Multi-Chapter'}`);

        // Initialize statuses
        const initialStatuses: Record<string, QuestionStatus> = {};
        data.questions.forEach((q: QuizQuestion, i: number) => {
          initialStatuses[q.id] = i === 0 ? 'not_answered' : 'unvisited';
        });
        setQuestionStatuses(initialStatuses);

        setTimerSecondsLeft(timeLimitMinutes * 60);
        setTotalElapsedTime(0);
        setIsTestActive(true);

        if (testMode === 'cbt') {
          setActiveView('cbt_test');
        } else {
          setActiveView('practice');
        }
      }
    } catch (err) {
      console.error("Failed to generate test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Launch direct practice for a chapter
  const handlePracticeChapter = (chapterName: string, subjectName: string) => {
    setSelectedSubjects([subjectName]);
    setSelectedChapters([chapterName]);
    setUserRequirements(`Comprehensive high-yield questions on ${chapterName}`);
    handleGenerateTest({
      subjects: [subjectName],
      chapters: [chapterName],
      topic: chapterName,
      user_requirements: `High-yield questions on ${chapterName}`,
      num_questions: 5
    });
  };

  // ---------------- CBT Test Actions ----------------
  const handleSelectQuestion = (idx: number) => {
    const currentQ = questions[currentIdx];
    if (currentQ) {
      // If was unvisited, mark not_answered if no response saved
      setQuestionStatuses(prev => {
        const curStatus = prev[currentQ.id];
        if (curStatus === 'unvisited') {
          return { ...prev, [currentQ.id]: 'not_answered' };
        }
        return prev;
      });
    }

    setCurrentIdx(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setQuestionStatuses(prev => {
        if (prev[targetQ.id] === 'unvisited') {
          return { ...prev, [targetQ.id]: 'not_answered' };
        }
        return prev;
      });
    }
  };

  const handleSaveAndNext = () => {
    const q = questions[currentIdx];
    if (!q) return;

    // Check if user has selected or entered an answer
    const ans = userAnswers[q.id];
    const isAnswered = ans !== undefined && ans !== null && ans !== '' && (!Array.isArray(ans) || ans.length > 0);

    setQuestionStatuses(prev => ({
      ...prev,
      [q.id]: isAnswered ? 'answered' : 'not_answered'
    }));

    if (currentIdx < questions.length - 1) {
      handleSelectQuestion(currentIdx + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    const q = questions[currentIdx];
    if (!q) return;

    const ans = userAnswers[q.id];
    const isAnswered = ans !== undefined && ans !== null && ans !== '' && (!Array.isArray(ans) || ans.length > 0);

    setQuestionStatuses(prev => ({
      ...prev,
      [q.id]: isAnswered ? 'answered_marked' : 'marked_review'
    }));

    if (currentIdx < questions.length - 1) {
      handleSelectQuestion(currentIdx + 1);
    }
  };

  const handleClearResponse = () => {
    const q = questions[currentIdx];
    if (!q) return;

    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });

    setQuestionStatuses(prev => ({
      ...prev,
      [q.id]: 'not_answered'
    }));
  };

  // Submit test and get analytics
  const handleFinalSubmitTest = async () => {
    setIsTestActive(false);
    setShowSubmitModal(false);
    setIsLoading(true);

    const submissionPayload = {
      target_exam: targetExam,
      test_title: testTitle,
      mode: testMode,
      total_time_seconds: totalElapsedTime,
      questions: questions.map(q => ({
        ...q,
        user_answer: userAnswers[q.id] ?? null
      }))
    };

    try {
      const res = await fetch('/api/quiz/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });
      const data: TestScorecard = await res.json();
      setScorecard(data);
      setActiveView('scorecard');
      onUpdateLearnerProfile?.();
    } catch (err) {
      console.error("Failed to submit test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Practice Mode Actions ----------------
  const handlePracticeSubmitCurrent = async () => {
    const q = questions[currentIdx];
    if (!q) return;

    let userAns: any = null;
    let subType = q.type;

    if (q.type === 'mcq') {
      if (selectedOption === null) return;
      userAns = selectedOption;
    } else if (q.type === 'multi_mcq') {
      if (multiSelectedOptions.length === 0) return;
      userAns = multiSelectedOptions;
    } else if (q.type === 'numerical') {
      if (!numericalValue.trim()) return;
      userAns = parseFloat(numericalValue);
    } else {
      if (!shortAnswerText.trim()) return;
      userAns = shortAnswerText;
    }

    setUserAnswers(prev => ({ ...prev, [q.id]: userAns }));

    try {
      const payload: any = {
        question_id: q.id,
        question_text: q.question,
        concept: q.concept,
        explanation: q.explanation,
        citation: q.citation,
        difficulty: q.difficulty
      };

      if (q.type === 'mcq') {
        payload.user_answer_index = selectedOption;
        payload.correct_index = q.correct_index ?? 0;
      } else if (q.type === 'multi_mcq') {
        payload.user_selected_indices = multiSelectedOptions;
        payload.correct_indices = q.correct_indices ?? [0];
      } else if (q.type === 'numerical') {
        payload.user_value = parseFloat(numericalValue);
        payload.correct_value = q.correct_value ?? 0.0;
        payload.tolerance = q.tolerance ?? 0.05;
        payload.calculation_steps = q.calculation_steps || '';
      } else {
        payload.user_answer = shortAnswerText;
        payload.rubric_points = q.rubric_points || [];
      }

      const res = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: subType,
          payload
        })
      });
      const result = await res.json();
      setPracticeResult(result);
      setPracticeGraded(true);

      if (result.remedial_question) {
        setRemedialQuestion(result.remedial_question);
      }
      onUpdateLearnerProfile?.();
    } catch (err) {
      console.error("Failed to grade practice question:", err);
    }
  };

  const handlePracticeNextQuestion = () => {
    setPracticeGraded(false);
    setPracticeResult(null);
    setSelectedOption(null);
    setMultiSelectedOptions([]);
    setNumericalValue('');
    setShortAnswerText('');
    setShowHint(false);
    setRemedialQuestion(null);
    setRemedialSelected(null);
    setRemedialGraded(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinalSubmitTest();
    }
  };

  // Retest mistakes from scorecard
  const handleRetestMistakes = () => {
    if (!scorecard) return;
    const missed = scorecard.evaluated_questions.filter(q => !q.is_correct);
    if (missed.length === 0) return;

    setQuestions(missed);
    setCurrentIdx(0);
    setUserAnswers({});
    setPracticeGraded(false);
    setPracticeResult(null);
    setTestTitle(`Mistake Retest: ${targetExam}`);
    setTimerSecondsLeft(missed.length * 2 * 60);
    setIsTestActive(true);
    setActiveView('practice');
  };

  // Current Question accessor
  const currentQ = questions[currentIdx];

  // Helper counts for CBT Palette
  const answeredCount = Object.values(questionStatuses).filter(s => s === 'answered' || s === 'answered_marked').length;
  const notAnsweredCount = Object.values(questionStatuses).filter(s => s === 'not_answered').length;
  const markedReviewCount = Object.values(questionStatuses).filter(s => s === 'marked_review' || s === 'answered_marked').length;
  const unvisitedCount = Object.values(questionStatuses).filter(s => s === 'unvisited').length;

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fadeIn">
      {/* ----------------- TOP MARKS APP BAR ----------------- */}
      <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Target Exam Switcher & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 dark:bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Exam
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>5-Day Streak</span>
                </span>
              </div>
              <div className="relative mt-0.5">
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-none p-0 pr-6 focus:ring-0 cursor-pointer appearance-none hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                >
                  {availableExams.map((ex) => (
                    <option key={ex.id} value={ex.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                      {ex.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveView('create')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'create'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Test</span>
            </button>

            <button
              onClick={() => setActiveView('pyq_bank')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'pyq_bank'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PYQ Bank</span>
            </button>

            <button
              onClick={() => setActiveView('notebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'notebook'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Notebook ({notebookQuestions.length})</span>
            </button>

            {scorecard && (
              <button
                onClick={() => setActiveView('scorecard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'scorecard'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scorecard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- VIEW 1: CUSTOM TEST BUILDER ("CREATE TEST") ----------------- */}
      {activeView === 'create' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-teal-100 text-xs font-semibold backdrop-blur-xs">
                <Target className="w-3.5 h-3.5 text-teal-200" />
                <span>MARKS Custom Test Generator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Design Your Adaptive Test
              </h2>
              <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
                Configure your subjects, select high-yield chapters, specify custom question requirements, and choose between Practice Mode or timed CBT simulation.
              </p>
            </div>
          </div>

          {/* Builder Form Card */}
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Step 1: Subject & Chapter Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Select Subjects & Chapters
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (curriculum) {
                        const allChaps = curriculum.subjects.flatMap(s => s.chapters.map(c => c.name));
                        setSelectedChapters(allChaps);
                      }
                    }}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    onClick={() => setSelectedChapters([])}
                    className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Subject Tabs */}
              {curriculum?.subjects && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {curriculum.subjects.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj.name);
                    return (
                      <button
                        key={subj.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjects(prev => prev.filter(s => s !== subj.name));
                          } else {
                            setSelectedSubjects(prev => [...prev, subj.name]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{subj.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                          {subj.chapters.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Chapter Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search chapters in selected subjects..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Chapter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                {curriculum?.subjects
                  .filter(s => selectedSubjects.includes(s.name))
                  .flatMap(s => s.chapters)
                  .filter(c => c.name.toLowerCase().includes(chapterSearch.toLowerCase()))
                  .map((chap) => {
                    const isChecked = selectedChapters.includes(chap.name);
                    return (
                      <div
                        key={chap.name}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedChapters(prev => prev.filter(c => c !== chap.name));
                          } else {
                            setSelectedChapters(prev => [...prev, chap.name]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-teal-700 border-teal-700 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{chap.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {chap.pyq_count} PYQs
                            </span>
                            {chap.weightage === 'High' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                High Weightage
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Step 2: Question Types & Source Filters */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Question Format & Source Filter
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question Types */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Types Included:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'mcq' as QuestionType, label: 'Single Choice MCQ (+4, -1)' },
                      { id: 'multi_mcq' as QuestionType, label: 'Multi-Choice (+4, -2)' },
                      { id: 'numerical' as QuestionType, label: 'Numerical / Integer (+4, 0)' },
                      { id: 'short_answer' as QuestionType, label: 'Conceptual Short Answer' }
                    ].map((typeItem) => {
                      const isSelected = questionTypes.includes(typeItem.id);
                      return (
                        <button
                          key={typeItem.id}
                          onClick={() => {
                            if (isSelected && questionTypes.length > 1) {
                              setQuestionTypes(prev => prev.filter(t => t !== typeItem.id));
                            } else if (!isSelected) {
                              setQuestionTypes(prev => [...prev, typeItem.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {typeItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Source Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Source Pool:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Question Sources' },
                      { id: 'pyq', label: 'PYQ (2020-2025)' },
                      { id: 'nta_abhyas', label: 'NTA Abhyas / Mock' },
                      { id: 'ai_generated', label: 'AI Synthesis (Gemini 3.5)' }
                    ].map((src) => (
                      <button
                        key={src.id}
                        onClick={() => setSourceFilter(src.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          sourceFilter === src.id
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {src.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Difficulty & Test Duration */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Test Parameters & Rigor
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="easy">Easy (Foundational)</option>
                    <option value="intermediate">Moderate (Standard)</option>
                    <option value="advanced">Advanced (IIT / Olympiad Rigor)</option>
                    <option value="adaptive">🧠 Adaptive (BKT Dynamic)</option>
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Count:</label>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 10, 15, 25].map(cnt => (
                      <button
                        key={cnt}
                        onClick={() => setNumQuestions(cnt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          numQuestions === cnt
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Limit:</label>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value={5}>5 Minutes (Sprint)</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (Full Section)</option>
                  </select>
                </div>

                {/* Marking Scheme */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Marking Scheme:</label>
                  <select
                    value={markingScheme}
                    onChange={(e) => setMarkingScheme(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="standard">Standard (+4 / -1)</option>
                    <option value="strict">Strict Advanced (+4 / -2)</option>
                    <option value="zero_neg">No Negative (+4 / 0)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: 🌟 USER REQUIREMENTS PROMPT (The Core Feature Highlight) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-cyan-50/70 dark:from-teal-950/30 dark:via-emerald-950/20 dark:to-cyan-950/30 border border-teal-200 dark:border-teal-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Your Custom Quiz Requirements
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Specify exact topics, numerical tolerances, concept traps, or special focus areas.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-300">
                  AI Grounded
                </span>
              </div>

              <textarea
                rows={3}
                value={userRequirements}
                onChange={(e) => setUserRequirements(e.target.value)}
                placeholder="e.g. Focus on definite integrals with odd/even symmetry, include tricky multi-step derivations and avoid direct formula applications, test edge cases..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
              />

              {/* Quick Requirement Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quick Prompts:</span>
                {[
                  "🔥 High-Weightage PYQ Traps",
                  "🧮 Heavy Numerical Calculations",
                  "🧗 Multi-Step Conceptual Derivations",
                  "🎯 Focus on BKT Knowledge Gaps",
                  "⚡ 15-Minute Speed Sprint",
                  "⚠️ Negative Sign & Curvature Traps"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setUserRequirements(prev => prev ? `${prev}. ${chip}` : chip);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Test Mode Selection & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Mode:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setTestMode('practice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      testMode === 'practice'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Practice Mode</span>
                  </button>
                  <button
                    onClick={() => setTestMode('cbt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      testMode === 'cbt'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>CBT Exam Simulator</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGenerateTest()}
                disabled={isLoading || selectedChapters.length === 0}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Test from Requirements...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Custom Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- VIEW 2: CHAPTER-WISE PYQ BANK ----------------- */}
      {activeView === 'pyq_bank' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Chapter-Wise PYQ Repository ({targetExam})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any chapter to launch targeted practice or view chapter weightage breakdown.
                </p>
              </div>
            </div>

            {/* Chapters list by subject */}
            <div className="space-y-6">
              {curriculum?.subjects.map((subj) => (
                <div key={subj.name} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{subj.name}</h4>
                    <span className="text-xs text-slate-400">({subj.chapters.length} Chapters)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subj.chapters.map((chap) => (
                      <div
                        key={chap.name}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500 transition-all group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                              {chap.name}
                            </h5>
                            {chap.weightage === 'High' && (
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                High Yield
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{chap.pyq_count} Questions</span>
                            <span>•</span>
                            <span>Difficulty: {chap.difficulty}</span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                            BKT Tracked
                          </span>
                          <button
                            onClick={() => handlePracticeChapter(chap.name, subj.name)}
                            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Practice</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- VIEW 3: CBT MOCK TEST MODE (NTA Simulator) ----------------- */}
      {activeView === 'cbt_test' && currentQ && (
        <div className="space-y-4">
          {/* CBT Header */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  {targetExam} Computer Based Test
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-medium">{testTitle}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              timerSecondsLeft < 120
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
                : timerSecondsLeft < 300
                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}>
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm font-bold">
                Time Remaining: {formatTime(timerSecondsLeft)}
              </span>
            </div>

            {/* Quick Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestionPaperModal(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
              >
                Question Paper
              </button>
              <button
                onClick={() => setShowCalculator(prev => !prev)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calc</span>
              </button>
              <button
                onClick={() => setShowFormulaSheet(prev => !prev)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formulas</span>
              </button>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Calculator Floating Widget */}
          {showCalculator && (
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-white max-w-xs space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold">Virtual Scientific Calculator</span>
                <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Standard NTA precision supported. Use virtual pad or keyboard.</p>
            </div>
          )}

          {/* Formula Sheet Floating Widget */}
          {showFormulaSheet && (
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-white max-w-sm space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold">Formula Quick Reference</span>
                <button onClick={() => setShowFormulaSheet(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="p-2 rounded bg-slate-800 font-mono text-teal-300">
                {currentQ?.formula_used ? (
                  <MathRenderer text={currentQ.formula_used} />
                ) : (
                  <span>Standard Parameter Update: θ_t+1 = θ_t - α ∇J(θ_t)</span>
                )}
              </div>
            </div>
          )}

          {/* Question Workspace + Palette Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left 3 Cols: Question Arena */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div className="space-y-4">
                {/* Question Info Bar */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Question {currentIdx + 1}
                    </span>
                    <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {currentQ.type}
                    </span>
                    {currentQ.exam_tag && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {currentQ.exam_tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(currentQ)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isBookmarked(currentQ.id)
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                      }`}
                      title="Save to Smart Notebook"
                    >
                      <Star className={`w-4 h-4 ${isBookmarked(currentQ.id) ? 'fill-amber-400' : ''}`} />
                    </button>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +{currentQ.marks_correct ?? 4}
                    </span>
                    <span className="text-xs font-bold text-rose-500">
                      {currentQ.marks_incorrect ?? -1}
                    </span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                  <MathRenderer text={currentQ.question} />
                </div>

                {/* Options / Input based on Type */}
                <div className="pt-2 space-y-3">
                  {/* Single MCQ */}
                  {currentQ.type === 'mcq' && currentQ.options && (
                    <div className="space-y-2">
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[currentQ.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setUserAnswers(prev => ({ ...prev, [currentQ.id]: oIdx }))}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-900 dark:text-teal-200 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 border ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">
                              <MathRenderer text={opt} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi MCQ */}
                  {currentQ.type === 'multi_mcq' && currentQ.options && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        (Multiple options may be correct. Select all matching options.)
                      </p>
                      {currentQ.options.map((opt, oIdx) => {
                        const curList: number[] = userAnswers[currentQ.id] || [];
                        const isSelected = curList.includes(oIdx);
                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              const updated = isSelected
                                ? curList.filter(i => i !== oIdx)
                                : [...curList, oIdx];
                              setUserAnswers(prev => ({ ...prev, [currentQ.id]: updated }));
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-900 dark:text-teal-200 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 border ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                            }`}>
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">
                              <MathRenderer text={opt} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Numerical Integer Type */}
                  {currentQ.type === 'numerical' && (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Enter your calculated numerical answer:
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.01"
                          value={userAnswers[currentQ.id] ?? ''}
                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                          placeholder="e.g. 4.5"
                          className="w-44 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                        />
                        {currentQ.tolerance !== undefined && (
                          <span className="text-xs text-slate-500 font-mono">
                            (Acceptable Tolerance: ±{currentQ.tolerance})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQ.type === 'short_answer' && (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={userAnswers[currentQ.id] ?? ''}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                        placeholder="Type your structured explanation and formula derivation..."
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearResponse}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Clear Response
                  </button>
                  <button
                    onClick={handleMarkForReviewAndNext}
                    className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                  >
                    Mark for Review & Next
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentIdx > 0 && (
                    <button
                      onClick={() => handleSelectQuestion(currentIdx - 1)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={handleSaveAndNext}
                    className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save & Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Question Palette (NTA MARKS style) */}
            <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                Question Palette
              </h4>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-300">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 inline-block shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-300">Not Answered ({notAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-300">Not Visited ({unvisitedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 inline-block shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-300">Review ({markedReviewCount})</span>
                </div>
              </div>

              {/* Numbered Palette Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {questions.map((q, idx) => {
                  const status = questionStatuses[q.id] || 'unvisited';
                  const isCurrent = idx === currentIdx;

                  let colorStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
                  if (status === 'answered') {
                    colorStyle = "bg-emerald-600 text-white border-emerald-600";
                  } else if (status === 'not_answered') {
                    colorStyle = "bg-rose-600 text-white border-rose-600";
                  } else if (status === 'marked_review') {
                    colorStyle = "bg-purple-600 text-white border-purple-600";
                  } else if (status === 'answered_marked') {
                    colorStyle = "bg-purple-600 text-white border-purple-600 relative after:content-[''] after:w-1.5 after:h-1.5 after:bg-emerald-400 after:rounded-full after:absolute after:top-0.5 after:right-0.5";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${colorStyle} ${
                        isCurrent ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- VIEW 4: PRACTICE MODE (Instant Solutions & Remediation) ----------------- */}
      {activeView === 'practice' && currentQ && (
        <div className="space-y-4">
          {/* Header Progress */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {currentQ.type}
              </span>
              <span className="text-[10px] text-slate-400">
                Concept: {currentQ.concept}
              </span>
            </div>

            <button
              onClick={() => toggleBookmark(currentQ)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-500 cursor-pointer"
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked(currentQ.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span>{isBookmarked(currentQ.id) ? 'Bookmarked' : 'Save Question'}</span>
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
              <MathRenderer text={currentQ.question} />
            </h3>

            {/* Single MCQ */}
            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  let optStyle = "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-slate-300";

                  if (practiceGraded) {
                    if (oIdx === currentQ.correct_index) {
                      optStyle = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (isSelected && !practiceResult?.is_correct) {
                      optStyle = "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-teal-50 dark:bg-teal-950/50 border-teal-600 text-teal-900 dark:text-teal-200 font-semibold";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={practiceGraded}
                      onClick={() => setSelectedOption(oIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">
                        <MathRenderer text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi MCQ */}
            {currentQ.type === 'multi_mcq' && currentQ.options && (
              <div className="space-y-2.5">
                <p className="text-xs text-amber-600 font-semibold">(Multiple correct options allowed)</p>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = multiSelectedOptions.includes(oIdx);
                  let optStyle = "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200";

                  if (practiceGraded) {
                    const isCorrectOpt = currentQ.correct_indices?.includes(oIdx);
                    if (isCorrectOpt) {
                      optStyle = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (isSelected) {
                      optStyle = "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-teal-50 dark:bg-teal-950/50 border-teal-600 text-teal-900 dark:text-teal-200 font-semibold";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={practiceGraded}
                      onClick={() => {
                        setMultiSelectedOptions(prev =>
                          isSelected ? prev.filter(i => i !== oIdx) : [...prev, oIdx]
                        );
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 border">
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">
                        <MathRenderer text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical Mode */}
            {currentQ.type === 'numerical' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Calculated Value:</span>
                  <input
                    type="number"
                    step="0.001"
                    disabled={practiceGraded}
                    value={numericalValue}
                    onChange={(e) => setNumericalValue(e.target.value)}
                    placeholder="e.g. 4.5"
                    className="w-36 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                  {currentQ.tolerance !== undefined && (
                    <span className="text-xs text-slate-400 font-mono">
                      (Tolerance: ±{currentQ.tolerance})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Short Answer */}
            {currentQ.type === 'short_answer' && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  disabled={practiceGraded}
                  value={shortAnswerText}
                  onChange={(e) => setShortAnswerText(e.target.value)}
                  placeholder="Type your step derivation and conceptual intuition..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>
            )}

            {/* Hint Accordion */}
            {currentQ.hint && (
              <div className="pt-1">
                <button
                  onClick={() => setShowHint(prev => !prev)}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    <MathRenderer text={currentQ.hint} />
                  </div>
                )}
              </div>
            )}

            {/* Submit / Verify Action */}
            {!practiceGraded ? (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handlePracticeSubmitCurrent}
                  disabled={
                    (currentQ.type === 'mcq' && selectedOption === null) ||
                    (currentQ.type === 'multi_mcq' && multiSelectedOptions.length === 0) ||
                    (currentQ.type === 'numerical' && !numericalValue.trim()) ||
                    (currentQ.type === 'short_answer' && !shortAnswerText.trim())
                  }
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Submit & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Grading & Solution Card */
              <div className="space-y-4 pt-2">
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  practiceResult?.is_correct
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {practiceResult?.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <h4 className="font-bold text-xs sm:text-sm">
                        {practiceResult?.is_correct ? "Correct! Concept Demonstrated" : "Misconception Detected"}
                      </h4>
                    </div>

                    {practiceResult?.bkt_mastery && (
                      <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>BKT: {(practiceResult.bkt_mastery.new_mastery * 100).toFixed(1)}%</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed">{practiceResult?.feedback}</p>
                </div>

                {/* Step-by-Step Verified Solution & Formula */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Step-by-Step Solution & Formula
                    </span>
                    {currentQ.citation && (
                      <button
                        onClick={() => {
                          const tag = currentQ.citation;
                          onCitationClick({
                            tag,
                            source_name: "Curriculum Material",
                            source_type: tag.includes('@') ? 'video' : 'pdf',
                            timestamp_str: tag.match(/@\s*(\d{1,2}:\d{2})/)?.[1],
                            snippet: currentQ.explanation
                          });
                        }}
                        className="text-[11px] font-mono text-teal-700 dark:text-teal-400 underline flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>{currentQ.citation}</span>
                      </button>
                    )}
                  </div>

                  {currentQ.formula_used && (
                    <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 font-mono text-teal-900 dark:text-teal-200">
                      <strong>Formula: </strong>
                      <MathRenderer text={currentQ.formula_used} />
                    </div>
                  )}

                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <MathRenderer text={currentQ.explanation} />
                  </div>
                </div>

                {/* Remedial Scaffolding if missed */}
                {remedialQuestion && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Adaptive Remedial Follow-Up (Foundational Scaffolding):</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      <MathRenderer text={remedialQuestion.question} />
                    </p>

                    <div className="space-y-2">
                      {remedialQuestion.options?.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={remedialGraded}
                          onClick={() => setRemedialSelected(oIdx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${
                            remedialGraded && oIdx === remedialQuestion.correct_index
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold'
                              : remedialSelected === oIdx
                              ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span><MathRenderer text={opt} /></span>
                        </button>
                      ))}
                    </div>

                    {!remedialGraded ? (
                      <button
                        onClick={() => setRemedialGraded(true)}
                        disabled={remedialSelected === null}
                        className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Verify Remedial Answer
                      </button>
                    ) : (
                      <p className="text-amber-800 dark:text-amber-200 italic font-medium">
                        {remedialSelected === remedialQuestion.correct_index
                          ? "Great job reinforcing foundational concepts! You are now prepared to advance."
                          : `Explanation: ${remedialQuestion.explanation}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Next Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveView('create')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Back to Test Generator
                  </button>

                  <button
                    onClick={handlePracticeNextQuestion}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>{currentIdx < questions.length - 1 ? "Next Question" : "Finish & View Analytics"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- VIEW 5: SCORECARD & PERFORMANCE ANALYTICS ----------------- */}
      {activeView === 'scorecard' && scorecard && (
        <div className="space-y-6">
          {/* Header Scorecard Card */}
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Assessment Analytics & Performance
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {scorecard.test_title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetestMistakes}
                  disabled={scorecard.incorrect_count === 0}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retest Mistakes ({scorecard.incorrect_count})</span>
                </button>
                <button
                  onClick={() => setActiveView('create')}
                  className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Custom Test</span>
                </button>
                <button
                  onClick={onNavigateToReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>BKT Gap Report</span>
                </button>
              </div>
            </div>

            {/* Score Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Score Obtained</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {scorecard.marks_obtained} <span className="text-xs font-normal text-slate-400">/ {scorecard.max_marks}</span>
                </p>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{scorecard.score_pct}% Score</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accuracy Rate</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">
                  {scorecard.accuracy_pct}%
                </p>
                <span className="text-[10px] text-slate-400">{scorecard.correct_count} of {scorecard.correct_count + scorecard.incorrect_count} attempted</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Time Taken</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatTime(scorecard.total_time_seconds)}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  ~{Math.round(scorecard.total_time_seconds / (scorecard.total_questions || 1))}s / Question
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Percentile</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {scorecard.percentile_estimate}%ile
                </p>
                <span className="text-[10px] text-slate-400">Competitive Standings</span>
              </div>
            </div>

            {/* Status counts bar */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Correct: {scorecard.correct_count}
              </span>
              <span className="text-rose-500 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Incorrect: {scorecard.incorrect_count}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" /> Unattempted: {scorecard.unattempted_count}
              </span>
            </div>
          </div>

          {/* Question-by-Question Review List */}
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Detailed Question Review & Solutions
              </h4>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
                {(['all', 'incorrect', 'correct', 'unattempted', 'bookmarked'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setScorecardFilter(flt)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                      scorecardFilter === flt
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {scorecard.evaluated_questions
                .filter(q => {
                  if (scorecardFilter === 'incorrect') return !q.is_correct && q.user_answer !== null && q.user_answer !== undefined;
                  if (scorecardFilter === 'correct') return q.is_correct;
                  if (scorecardFilter === 'unattempted') return q.user_answer === null || q.user_answer === undefined || q.user_answer === '';
                  if (scorecardFilter === 'bookmarked') return isBookmarked(q.id);
                  return true;
                })
                .map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0" style={{
                          backgroundColor: q.is_correct ? '#10B981' : (q.user_answer === null || q.user_answer === undefined ? '#64748B' : '#EF4444')
                        }}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {q.concept}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {q.type}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleBookmark(q)}
                        className="text-slate-400 hover:text-amber-500 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${isBookmarked(q.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      <MathRenderer text={q.question} />
                    </div>

                    {/* Solution and Answer breakdown */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      {q.formula_used && (
                        <div className="text-teal-700 dark:text-teal-300 font-mono font-semibold">
                          Formula: <MathRenderer text={q.formula_used} />
                        </div>
                      )}
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong>Solution: </strong>
                        <MathRenderer text={q.explanation} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- VIEW 6: SMART NOTEBOOK / MISTAKE BOOK ----------------- */}
      {activeView === 'notebook' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Smart Notebook ({notebookQuestions.length} Questions)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All your saved tricky questions, trap numericals, and revision cards stored here.
                </p>
              </div>

              {notebookQuestions.length > 0 && (
                <button
                  onClick={() => {
                    setQuestions(notebookQuestions);
                    setCurrentIdx(0);
                    setUserAnswers({});
                    setTestTitle('Smart Notebook Revision Sprint');
                    setActiveView('practice');
                  }}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Notebook ({notebookQuestions.length})</span>
                </button>
              )}
            </div>

            {notebookQuestions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Your Notebook is Empty</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  While solving questions in CBT or Practice mode, click the star icon to save questions to your notebook for quick pre-exam revision.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notebookQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-teal-700 dark:text-teal-400">#{idx + 1}</span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{q.concept}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.exam_tag || targetExam}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleBookmark(q)}
                        className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <MathRenderer text={q.question} />
                    </p>

                    {q.formula_used && (
                      <p className="text-xs font-mono text-teal-700 dark:text-teal-300">
                        Formula: <MathRenderer text={q.formula_used} />
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Solution: </strong>
                      <MathRenderer text={q.explanation} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SUBMIT CONFIRMATION MODAL ----------------- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Submit Assessment?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please review your status before finalizing your assessment submission:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold">
                Answered: {answeredCount}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold">
                Not Answered: {notAnsweredCount}
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold">
                Marked for Review: {markedReviewCount}
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                Not Visited: {unvisitedCount}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmitTest}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- QUESTION PAPER MODAL ----------------- */}
      {showQuestionPaperModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E2522] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Complete Question Paper View
              </h3>
              <button
                onClick={() => setShowQuestionPaperModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-700 dark:text-teal-400">Q{idx + 1} ({q.type})</span>
                    <span className="text-[11px] text-slate-400 font-mono">+{q.marks_correct ?? 4} / {q.marks_incorrect ?? -1}</span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    <MathRenderer text={q.question} />
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowQuestionPaperModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
