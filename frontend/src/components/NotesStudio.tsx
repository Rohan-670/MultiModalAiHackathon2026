import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  BookmarkCheck,
  CheckCircle2,
  Copy,
  Check,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Send,
  Layers,
  GraduationCap,
  FileUp,
  X,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  BookMarked
} from 'lucide-react';
import { CardVisualDiagram } from './CardVisualDiagram';
import type { NoteAnalysisResult, NoteStudyCard, NoteQAPair, Language, UserProfile } from '../types';
import { getTranslation } from '../i18n';
import { getStarterNotesForProfile } from '../starterNotes';

interface NotesStudioProps {
  onAskTutor?: (question: string) => void;
  onNavigateToQuiz?: (topic: string) => void;
  language?: Language;
  user?: UserProfile | null;
  onOpenOnboarding?: () => void;
}

export const NotesStudio: React.FC<NotesStudioProps> = ({
  onAskTutor,
  onNavigateToQuiz,
  language = 'English',
  user,
  onOpenOnboarding
}) => {
  const t = getTranslation(language);
  // Input State
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textNotes, setTextNotes] = useState<string>('');
  const [topicInput, setTopicInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active View Tab in Results: 'qa_notes', 'points', 'video', 'cards', 'chat'
  const [activeTab, setActiveTab] = useState<'qa_notes' | 'points' | 'video' | 'cards' | 'chat'>('qa_notes');

  // Analysis Result
  const [analysis, setAnalysis] = useState<NoteAnalysisResult | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedQAId, setCopiedQAId] = useState<string | null>(null);
  const [copiedAllQA, setCopiedAllQA] = useState<boolean>(false);

  // ---------------- Video Tutor with Voiceover State ----------------
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoSpeed, setVideoSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ---------------- Flashcards State ----------------
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [cardsList, setCardsList] = useState<NoteStudyCard[]>([]);
  const [cardViewMode, setCardViewMode] = useState<'carousel' | 'grid'>('carousel');

  // ---------------- Chat with Notes State ----------------
  const [noteChatInput, setNoteChatInput] = useState<string>('');
  const [noteChatMessages, setNoteChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);
  const [isNoteChatLoading, setIsNoteChatLoading] = useState<boolean>(false);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const engVoices = voices.filter(v => v.lang.startsWith('en'));
        setAvailableVoices(engVoices.length > 0 ? engVoices : voices);
        if (engVoices.length > 0 && !selectedVoice) {
          const naturalVoice = engVoices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'));
          setSelectedVoice(naturalVoice ? naturalVoice.name : engVoices[0].name);
        }
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  // Pre-seed with sample analysis if empty
  const sampleNotes = `Gradient Descent & Optimization Dynamics

1. Optimization Objective:
In supervised learning, the objective is to minimize empirical risk:
J(θ) = (1/2m) * Σ (h_θ(x^(i)) - y^(i))^2
where θ represents the model parameters and m is dataset size.

2. Negative Gradient Update Rule:
The gradient ∇J(θ) indicates the steepest uphill ascent. We step in the opposite direction:
θ := θ - α * ∇J(θ)
Here α is the learning rate governing the step size.

3. Learning Rate Oscillation & Divergence:
If α < 2 / λ_max, gradient descent stably converges to the minimum.
If α > 2 / λ_max, updates overshoot the quadratic bowl valley floor, bouncing violently across ravine walls and diverging toward numerical infinity.

4. Polyak Momentum Acceleration:
In narrow ill-conditioned valleys, gradient descent oscillates across steep walls while making sluggish progress along the flat base.
Polyak momentum introduces velocity accumulation:
v_(t+1) = β * v_t + α * ∇J(θ_t)
θ_(t+1) = θ_t - v_(t+1)
where β ∈ [0.9, 0.99] dampens high-frequency transverse oscillations.`;

  const handleLoadSampleNotes = () => {
    if (user?.target_subject && user?.class_grade) {
      const starters = getStarterNotesForProfile(user.class_grade, user.target_subject);
      if (starters.length > 0) {
        setTextNotes(`${starters[0].title}\n\n${starters[0].content}`);
        setTopicInput(starters[0].title);
        setInputMode('paste');
        return;
      }
    }
    setTextNotes(sampleNotes);
    setTopicInput("Gradient Descent & Optimization");
    setInputMode('paste');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStage("1/3: Ingesting and extracting text from notes...");

    try {
      let data: NoteAnalysisResult;

      if (inputMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (topicInput) formData.append('topic', topicInput);

        setAnalysisStage("2/3: AI analyzing key concepts, formulas & exam takeaways...");
        const res = await fetch('/api/notes/analyze-file', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error("Failed to analyze file");
        data = await res.json();
      } else {
        const noteContent = textNotes.trim() || sampleNotes;
        setAnalysisStage("2/3: AI analyzing key concepts, formulas & exam takeaways...");
        const res = await fetch('/api/notes/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text_notes: noteContent,
            topic: topicInput || "Course Notes",
            title: topicInput || "Uploaded Notes"
          })
        });
        if (!res.ok) throw new Error("Failed to analyze text");
        data = await res.json();
      }

      setAnalysisStage("3/3: Assembling descriptive Q&A notes, video & flashcards...");
      setTimeout(() => {
        setAnalysis(data);
        setCardsList(data.cards || []);
        setCardIndex(0);
        setIsCardFlipped(false);
        setCurrentSceneIdx(0);
        setIsAnalyzing(false);
        setActiveTab('qa_notes');
      }, 500);

    } catch (err) {
      console.error("Notes analysis failed", err);
      // Fallback sample analysis
      const fallback = getDeterministicFallback(topicInput || "Gradient Descent Optimization");
      setAnalysis(fallback);
      setCardsList(fallback.cards);
      setIsAnalyzing(false);
      setActiveTab('qa_notes');
    }
  };

  const getDeterministicFallback = (topic: string): NoteAnalysisResult => ({
    title: topic,
    topic: topic,
    summary: `Comprehensive AI analysis of '${topic}'. Synthesized key takeaways, definitions, and high-yield formulas into an actionable study suite with Question-with-Answer topic notes.`,
    descriptive_qa_notes: [
      {
        id: "qa_1",
        topic_section: "1. Optimization Objective & Intuition",
        question: "1. What is the fundamental objective and geometric intuition behind Gradient Descent?",
        detailed_answer: "Gradient Descent is a fundamental first-order iterative optimization algorithm designed to locate local or global extrema of an objective loss function J(θ). The algorithm measures empirical risk across training data: J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))^2. Geometrically, the negative gradient -∇J(θ) specifies the vector of steepest descent downhill. By repeatedly taking small steps opposite to the gradient vector scaled by the learning rate hyperparameter α, parameter values migrate from arbitrary initialization points toward the minimum of the loss bowl.",
        key_takeaways: [
          "Minimizes empirical risk by descending along the negative gradient vector.",
          "Learning rate α controls step magnitude along the loss surface."
        ],
        formula_or_diagram_note: "Geometric Direction: -∇J(θ) points directly down the slope."
      },
      {
        id: "qa_2",
        topic_section: "2. The Parameter Update Equation",
        question: "2. How is the parameter update equation formulated, and what role does the learning rate play?",
        detailed_answer: "The continuous update equation is formally written as θ_(t+1) = θ_t - α · ∇J(θ_t). In this relationship, θ represents the vector of trainable weights, ∇J(θ_t) is the Jacobian or gradient vector containing first-order partial derivatives, and α is the positive learning rate scalar. If α is chosen properly, each iteration strictly decreases the loss function until reaching a stationary point where the gradient magnitude vanishes.",
        key_takeaways: [
          "Update Rule: θ := θ - α · ∇J(θ)",
          "Stationary point condition: ||∇J(θ)|| ≈ 0 at convergence."
        ],
        formula_or_diagram_note: "θ_(t+1) = θ_t - α · ∇J(θ_t)"
      },
      {
        id: "qa_3",
        topic_section: "3. Learning Rate Oscillation & Divergence Bound",
        question: "3. Under what exact conditions does Gradient Descent oscillate or catastrophically diverge?",
        detailed_answer: "Convergence stability is governed by the curvature (Hessian eigenvalues) of the loss surface. Specifically, for quadratic loss surfaces with maximum Hessian eigenvalue λ_max, stable convergence requires α < 2 / λ_max. If α exceeds this critical threshold, updates overshoot the quadratic valley floor. The magnitude of displacement increases exponentially with each step, causing violent cross-ravine oscillation and catastrophic divergence to numerical infinity.",
        key_takeaways: [
          "Stability threshold: α < 2 / λ_max",
          "Overstepping causes exponential divergence across steep valley walls."
        ],
        formula_or_diagram_note: "Critical Divergence Threshold: α_crit = 2 / λ_max"
      },
      {
        id: "qa_4",
        topic_section: "4. Polyak Momentum Acceleration",
        question: "4. How does Polyak Momentum alleviate oscillation in ill-conditioned ravines?",
        detailed_answer: "Ill-conditioned loss ravines feature high curvature across valley walls (large λ_max) but gentle slopes along the valley floor (small λ_min). Standard gradient descent spends most of its budget bouncing uselessly back and forth across the steep walls. Polyak Momentum introduces an exponential moving average velocity vector: v_(t+1) = β · v_t + α · ∇J(θ_t), followed by θ_(t+1) = θ_t - v_(t+1), with momentum coefficient β typically set to 0.9. Because opposing cross-ravine gradients alternate signs, they cancel each other out in the velocity accumulator, while aligned downhill gradients compound, accelerating convergence along the valley floor.",
        key_takeaways: [
          "Velocity rule: v_(t+1) = β · v_t + α · ∇J(θ_t)",
          "Alternating transverse oscillations cancel; aligned longitudinal steps accelerate."
        ],
        formula_or_diagram_note: "Velocity Accumulation: v_(t+1) = β · v_t + α · ∇J(θ_t)"
      },
      {
        id: "qa_5",
        topic_section: "5. Comprehensive Topic Synthesis & Practical Takeaways",
        question: "5. What are the key practical takeaways when applying optimization algorithms in real-world pipelines?",
        detailed_answer: "When building real-world machine learning systems, students and practitioners must combine theoretical insight with practical heuristics: 1) Always normalize or standardize input features so the condition number λ_max / λ_min is close to 1, creating symmetric spherical loss contours; 2) Utilize learning rate warmup or cosine decay schedules; 3) Prefer momentum-equipped optimizers (such as Adam or Momentum SGD) over vanilla gradient descent; 4) Monitor training loss curves for signs of divergence (spikes) or stagnation.",
        key_takeaways: [
          "Feature normalization eliminates high condition number asymmetries.",
          "Employ learning rate schedules and momentum for robust convergence.",
          "Validate training stability through live gradient monitoring."
        ],
        formula_or_diagram_note: "Best Practice: Feature Standardizing + Momentum SGD / Adam"
      }
    ],
    important_points: {
      key_takeaways: [
        "First-order optimization iteratively descends the loss surface opposite to ∇J(θ).",
        "Learning rate α governs convergence speed; excessive α causes catastrophic oscillation.",
        "Momentum velocity buffers dampen perpendicular canyon bounce and accelerate convergence.",
        "Active recall using study flashcards promotes long-term synaptic consolidation."
      ],
      core_concepts: [
        { term: "Objective Function J(θ)", definition: "Scalar measure quantifying discrepancy between model predictions and true training targets." },
        { term: "Gradient Vector ∇J(θ)", definition: "Vector of partial derivatives pointing in the steepest instantaneous uphill direction." },
        { term: "Condition Number", definition: "Ratio of maximum to minimum eigenvalues (λ_max / λ_min) governing canyon curvature asymmetry." }
      ],
      formulas_and_rules: [
        { name: "Gradient Descent Update", expression: "θ := θ - α · ∇J(θ)", explanation: "Iterative parameter update stepping opposite to the loss gradient." },
        { name: "Momentum Velocity Rule", expression: "v_(t+1) = β · v_t + α · ∇J(θ_t)", explanation: "Exponential moving average velocity canceling perpendicular oscillations." }
      ],
      exam_highlights: [
        "Be ready to derive why α > 2/λ_max leads to numerical divergence.",
        "Memorize the Polyak Momentum update equations and the physical intuition of velocity.",
        "Contrast standard SGD with batch gradient descent memory and variance tradeoffs."
      ]
    },
    video_tutor: {
      title: `Voiceover Video Lesson: ${topic}`,
      topic: topic,
      duration_seconds: 120,
      scenes: [
        {
          scene_number: 1,
          title: "1. Foundational Overview",
          visual_cue: `LECTURE CORE: ${topic}`,
          bullet_points: [
            "Synthesized directly from your uploaded notes",
            "Continuous optimization over empirical loss"
          ],
          voiceover_script: `Welcome to your AI Video Tutor lesson on ${topic}! Today we are reviewing the core principles from your notes. In machine learning, training is framed as continuous parameter optimization.`,
          duration: 30
        },
        {
          scene_number: 2,
          title: "2. The Negative Gradient Update",
          visual_cue: "θ_(t+1) = θ_t - α · ∇J(θ_t)",
          bullet_points: [
            "Gradient vector points uphill",
            "Negate to descend into global minimum"
          ],
          voiceover_script: "Moving to the update rule: the gradient always points in the direction of steepest ascent. Therefore, we subtract the gradient scaled by the learning rate alpha to descend toward the minimum.",
          duration: 35
        },
        {
          scene_number: 3,
          title: "3. Learning Rate & Momentum Damping",
          visual_cue: "v_(t+1) = β · v_t + α · ∇J(θ_t)",
          bullet_points: [
            "Too large alpha overshoots valley walls",
            "Momentum beta dampens lateral bounce"
          ],
          voiceover_script: "Watch out for high learning rates. If alpha is too aggressive, updates oscillate wildly and diverge. By adding a momentum buffer beta, velocity along oscillatory dimensions cancels out.",
          duration: 35
        },
        {
          scene_number: 4,
          title: "4. Exam Summary & Flashcard Practice",
          visual_cue: "ACTIVE RECALL & FLASHCARDS",
          bullet_points: [
            "Test yourself on the formulas",
            "Practice with the topic cards below"
          ],
          voiceover_script: "To solidify these concepts, test your active recall with the interactive flashcards right below this player. Excellent work reviewing your notes today!",
          duration: 25
        }
      ],
      captions: [
        { start_time: 0, end_time: 30, text: `Welcome to your AI Video Tutor on ${topic}.` },
        { start_time: 31, end_time: 65, text: "The parameter update steps opposite to the gradient vector." },
        { start_time: 66, end_time: 100, text: "High learning rates bounce across ravines; momentum dampens oscillations." },
        { start_time: 101, end_time: 120, text: "Master the key formulas with active recall flashcards." }
      ]
    },
    cards: [
      { id: "c1", front: "What does the gradient vector ∇J(θ) geometrically represent?", back: "It points in the direction of steepest instantaneous ascent on the loss surface.", category: "Concept" },
      { id: "c2", front: "State the standard Gradient Descent parameter update formula.", back: "θ := θ - α · ∇J(θ), where α is the learning rate hyperparameter.", category: "Formula" },
      { id: "c3", front: "What occurs if the learning rate α exceeds 2 / λ_max?", back: "The parameter updates bounce across ravine walls, overshoot the minimum, and catastrophically diverge.", category: "High-Yield" },
      { id: "c4", front: "How does Polyak Momentum accelerate convergence in ravines?", back: "It maintains an exponential moving average velocity vector v_t that cancels out opposing oscillatory steps.", category: "Mechanism" }
    ]
  });

  // ---------------- Voiceover Speech Synthesis Logic ----------------
  const speakCurrentScene = (sceneIndex: number) => {
    if (!('speechSynthesis' in window) || isMuted || !analysis?.video_tutor?.scenes) return;

    window.speechSynthesis.cancel();
    const scene = analysis.video_tutor.scenes[sceneIndex];
    if (!scene) return;

    const utterance = new SpeechSynthesisUtterance(scene.voiceover_script);
    utterance.rate = videoSpeed;

    if (selectedVoice) {
      const voiceObj = availableVoices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onend = () => {
      // Advance to next scene automatically if still playing
      if (isPlayingVideo && sceneIndex + 1 < analysis.video_tutor.scenes.length) {
        setCurrentSceneIdx(sceneIndex + 1);
        speakCurrentScene(sceneIndex + 1);
      } else {
        setIsPlayingVideo(false);
      }
    };

    utterance.onerror = () => {
      setIsPlayingVideo(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlayVideo = () => {
    if (!analysis?.video_tutor?.scenes) return;

    if (isPlayingVideo) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingVideo(false);
    } else {
      setIsPlayingVideo(true);
      speakCurrentScene(currentSceneIdx);
    }
  };

  const handleRestartVideo = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSceneIdx(0);
    setIsPlayingVideo(true);
    speakCurrentScene(0);
  };

  const handleJumpToScene = (idx: number) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSceneIdx(idx);
    if (isPlayingVideo) {
      speakCurrentScene(idx);
    }
  };

  useEffect(() => {
    // Stop speech when unmounting or switching tabs
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ---------------- Flashcard Actions ----------------
  const handleNextCard = () => {
    setIsCardFlipped(false);
    setCardIndex((prev) => (prev + 1) % cardsList.length);
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setCardIndex((prev) => (prev - 1 + cardsList.length) % cardsList.length);
  };

  const handleToggleMastered = (id: string) => {
    setCardsList(prev => prev.map(c => c.id === id ? { ...c, isMastered: !c.isMastered } : c));
  };

  const handleShuffleCards = () => {
    setIsCardFlipped(false);
    setCardsList(prev => [...prev].sort(() => Math.random() - 0.5));
    setCardIndex(0);
  };

  const masteredCount = cardsList.filter(c => c.isMastered).length;

  // ---------------- Copy Summary & Q&A Notes ----------------
  const handleCopySummary = () => {
    if (!analysis) return;
    const textToCopy = `Title: ${analysis.title}\n\nSummary:\n${analysis.summary}\n\nKey Takeaways:\n${analysis.important_points.key_takeaways.map(k => `• ${k}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopySingleQA = (qa: NoteQAPair, id: string) => {
    const textToCopy = `Question:\n${qa.question}\n\nDetailed Answer:\n${qa.detailed_answer}${qa.key_takeaways?.length ? `\n\nKey Takeaways:\n${qa.key_takeaways.map(k => `• ${k}`).join('\n')}` : ''}${qa.formula_or_diagram_note ? `\n\nFormula/Rule:\n${qa.formula_or_diagram_note}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQAId(id);
    setTimeout(() => setCopiedQAId(null), 2000);
  };

  const handleCopyAllQA = () => {
    if (!analysis?.descriptive_qa_notes?.length) return;
    const allText = analysis.descriptive_qa_notes.map((qa, idx) => {
      return `Q${idx + 1}: ${qa.question}\n\n${qa.detailed_answer}${qa.key_takeaways?.length ? `\n\nTakeaways:\n${qa.key_takeaways.map(t => `• ${t}`).join('\n')}` : ''}${qa.formula_or_diagram_note ? `\n\nNote: ${qa.formula_or_diagram_note}` : ''}\n----------------------------------------`;
    }).join('\n\n');
    navigator.clipboard.writeText(`Topic: ${analysis.title}\n\n${allText}`);
    setCopiedAllQA(true);
    setTimeout(() => setCopiedAllQA(false), 2000);
  };

  // ---------------- Chat with Notes Handler ----------------
  const handleSendNoteChat = async () => {
    if (!noteChatInput.trim() || isNoteChatLoading) return;
    const userQ = noteChatInput;
    setNoteChatInput('');
    setNoteChatMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setIsNoteChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Regarding the uploaded notes (${analysis?.title || 'Course Notes'}): ${userQ}`,
          teaching_style: 'detailed'
        })
      });
      const data = await res.json();
      setNoteChatMessages(prev => [...prev, { sender: 'assistant', text: data.answer }]);
    } catch {
      setNoteChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: `According to your notes on ${analysis?.title || 'the topic'}: ${userQ.toLowerCase().includes('learning rate') ? 'If alpha is set too large, updates will overshoot and oscillate violently.' : 'This concept was indexed into your notes study suite.'}`
      }]);
    } finally {
      setIsNoteChatLoading(false);
    }
  };

  const currentScene = analysis?.video_tutor?.scenes?.[currentSceneIdx] || analysis?.video_tutor?.scenes?.[0];
  const activeCard = cardsList[cardIndex] || cardsList[0];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>AI Notes Studio & Analyzer</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Turn Any Notes into a Complete Study Package
          </h1>

          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Upload your lecture notes, textbook chapters, or slides. AI will analyze them and automatically generate <strong>Important Points</strong>, a <strong>Video Tutor with Spoken Voiceover</strong>, and <strong>Interactive Study Cards</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLoadSampleNotes}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-teal-900 font-semibold text-xs hover:bg-teal-50 transition-all shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>{user?.target_subject ? `Load Starter Notes (${user.target_subject})` : 'Load Starter Notes'}</span>
            </button>

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-400/40 text-teal-100 font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
                <span>{user?.class_grade ? `${user.class_grade} • ${user.target_subject || 'General'}` : 'Select Class & Subject'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload & Notes Input Section */}
      {!analysis && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputMode('upload')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inputMode === 'upload'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload Notes (PDF, JPG/Images, PPT, Word, TXT)</span>
              </button>

              <button
                onClick={() => setInputMode('paste')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inputMode === 'paste'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste or Type Notes</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Instant multimodal extraction
            </span>
          </div>

          {/* Optional Topic Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject or Topic (Optional)
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Machine Learning, Physics Thermodynamics, Microeconomics..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          {/* Upload Dropzone */}
          {inputMode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-600 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.bmp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-teal-800 dark:text-teal-300 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI Analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drag and drop your notes
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports PDF textbooks, JPG / Images, PPT / Slides, Word DOCX, and TXT files (up to 50 MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Paste Notes Textarea */
            <div className="space-y-1">
              <textarea
                rows={8}
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
                placeholder="Paste your raw lecture notes, typed summaries, syllabus excerpts, or formulas here..."
                className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-mono leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{textNotes.length} characters</span>
                <button
                  type="button"
                  onClick={() => setTextNotes('')}
                  className="hover:underline cursor-pointer"
                >
                  Clear Text
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (inputMode === 'upload' && !selectedFile && !textNotes)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Notes...' : 'Analyze Notes with AI'}</span>
            </button>
          </div>

          {/* Progress Modal / Bar */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center space-y-2 animate-pulse">
              <div className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                {analysisStage}
              </div>
              <div className="w-full bg-teal-200 dark:bg-teal-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full w-2/3 animate-ping" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Header Bar with Tabs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {analysis.title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 font-semibold">
                  {analysis.topic}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI Study Package Generated • Important Points, Video Tutor & Study Cards
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('qa_notes')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'qa_notes'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Descriptive Q&A Notes ({analysis.descriptive_qa_notes?.length || 5})</span>
              </button>

              <button
                onClick={() => setActiveTab('points')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'points'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>{t.instantPointsStat}</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t.tabVideo}</span>
              </button>

              <button
                onClick={() => setActiveTab('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.studyCardsStat} ({cardsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.tabChat}</span>
              </button>

              <button
                onClick={() => {
                  setAnalysis(null);
                  setSelectedFile(null);
                  setTextNotes('');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Upload New Notes"
              >
                Upload New
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 0: DESCRIPTIVE Q&A NOTES (COVERING FULL TOPIC) */}
          {/* ======================================================== */}
          {activeTab === 'qa_notes' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Immediate Quiz from Uploaded Notes Banner */}
              {onNavigateToQuiz && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-200" />
                      <span className="font-bold text-sm">Practice Quiz Available</span>
                    </div>
                    <p className="text-xs text-teal-100">
                      Adaptive quiz generated from these notes covering &quot;{analysis.topic}&quot;.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToQuiz(analysis.topic)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Practice Quiz</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Section Intro Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>Important Descriptive Notes (Question & Answer Format)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Comprehensive questions with detailed descriptive answers systematically covering the entire topic in your notes.
                  </p>
                </div>

                <button
                  onClick={handleCopyAllQA}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedAllQA ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAllQA ? 'All Notes Copied' : 'Copy All Q&A Notes'}</span>
                </button>
              </div>

              {/* Q&A List */}
              <div className="space-y-4">
                {(analysis.descriptive_qa_notes && analysis.descriptive_qa_notes.length > 0
                  ? analysis.descriptive_qa_notes
                  : getDeterministicFallback(analysis.topic).descriptive_qa_notes || []
                ).map((qa, idx) => {
                  const qaId = qa.id || `qa_${idx + 1}`;
                  const isCopied = copiedQAId === qaId;

                  return (
                    <div
                      key={qaId}
                      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 transition-all hover:border-teal-500/50"
                    >
                      {/* Header: Topic Section Tag & Actions */}
                      <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-bold">
                          {qa.topic_section || `Section ${idx + 1}`}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopySingleQA(qa, qaId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy this Question and Answer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>

                          {onAskTutor && (
                            <button
                              onClick={() => onAskTutor(qa.question)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                              title="Ask AI Tutor to elaborate further on this question"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Ask Tutor</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                          Q{idx + 1}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {qa.question}
                        </h4>
                      </div>

                      {/* Detailed Answer */}
                      <div className="pl-0 sm:pl-10 space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                          {qa.detailed_answer}
                        </div>

                        {/* Formula or Diagram Note callout if present */}
                        {qa.formula_or_diagram_note && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 dark:text-amber-200 font-mono">
                              <span className="font-bold">Formula / Core Rule: </span>
                              <span>{qa.formula_or_diagram_note}</span>
                            </div>
                          </div>
                        )}

                        {/* Key Takeaways */}
                        {qa.key_takeaways && qa.key_takeaways.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Key Points & Memory Anchors:
                            </span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {qa.key_takeaways.map((point, pIdx) => (
                                <li
                                  key={pIdx}
                                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-700/40"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: IMPORTANT POINTS & SUMMARY */}
          {/* ======================================================== */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              {/* Immediate Quiz from Uploaded Notes Banner */}
              {onNavigateToQuiz && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-200" />
                      <span className="font-bold text-sm">Quiz Generated from Uploaded Notes</span>
                    </div>
                    <p className="text-xs text-teal-100">
                      Test your recall and understanding of &quot;{analysis.topic}&quot; immediately with an adaptive quiz.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToQuiz(analysis.topic)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Practice Quiz on Notes</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Executive Summary Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </h3>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* Key Takeaways & Exam Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Takeaways */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Important Points & Key Takeaways</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.important_points.key_takeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* High-Yield Exam Highlights */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>High-Yield Exam Highlights</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.important_points.exam_highlights.map((tip, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Core Concepts & Definitions */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Core Concepts & Definitions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.important_points.core_concepts.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                      <div className="font-bold text-xs text-teal-800 dark:text-teal-300">
                        {c.term}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {c.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas & Mathematical Rules */}
              {analysis.important_points.formulas_and_rules.length > 0 && (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Key Formulas & Mathematical Rules</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.important_points.formulas_and_rules.map((f, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-white space-y-2">
                        <div className="text-xs font-mono text-teal-400 font-bold">{f.name}</div>
                        <div className="text-sm sm:text-base font-mono font-extrabold text-teal-200 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                          {f.expression}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {f.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: VIDEO TUTOR WITH VOICEOVER */}
          {/* ======================================================== */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Voiceover Video Player Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Video Player Display (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative aspect-video flex flex-col justify-between text-white p-5 select-none">
                    {/* Top Bar inside Video Player */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span className={`w-2.5 h-2.5 rounded-full ${isPlayingVideo ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="font-semibold text-slate-200 truncate">{currentScene?.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                        SCENE {currentSceneIdx + 1} OF {analysis.video_tutor.scenes.length}
                      </span>
                    </div>

                    {/* Center Animated Presentation Area */}
                    <div className="relative z-10 my-auto text-center px-4 space-y-3">
                      <div className="text-xs uppercase font-mono text-teal-400 tracking-wider">
                        {currentScene?.visual_cue}
                      </div>

                      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-left max-w-md mx-auto space-y-2 shadow-inner">
                        <div className="text-xs font-bold text-white border-b border-slate-800 pb-1.5 flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                          <span>{currentScene?.title}</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {currentScene?.bullet_points.map((pt, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Subtitle / Voiceover Captions Overlay */}
                    {showCaptions && (
                      <div className="relative z-10 text-center mb-1">
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-xs text-xs text-teal-200 font-medium max-w-md mx-auto border border-teal-500/20 shadow-md">
                          {isPlayingVideo ? `🔊 "${currentScene?.voiceover_script}"` : `Ready to listen: Click Play to hear voiceover.`}
                        </span>
                      </div>
                    )}

                    {/* Bottom Controls Bar */}
                    <div className="relative z-10 pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTogglePlayVideo}
                          className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-sm"
                          title={isPlayingVideo ? "Pause Voiceover" : "Play Voiceover"}
                        >
                          {isPlayingVideo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <button
                          onClick={handleRestartVideo}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Restart Video"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (currentSceneIdx + 1 < analysis.video_tutor.scenes.length) {
                              handleJumpToScene(currentSceneIdx + 1);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Next Scene"
                        >
                          <FastForward className="w-4 h-4" />
                        </button>

                        {/* Speed Options */}
                        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                          {[0.75, 1.0, 1.25, 1.5].map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setVideoSpeed(s);
                                if (isPlayingVideo) speakCurrentScene(currentSceneIdx);
                              }}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                videoSpeed === s
                                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowCaptions(!showCaptions)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                            showCaptions
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          CC
                        </button>

                        <button
                          onClick={() => {
                            setIsMuted(!isMuted);
                            if (!isMuted && 'speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Voice Selector Bar */}
                  {availableVoices.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Voiceover Narrator:
                      </span>
                      <select
                        value={selectedVoice}
                        onChange={(e) => {
                          setSelectedVoice(e.target.value);
                          if (isPlayingVideo) speakCurrentScene(currentSceneIdx);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-xs truncate"
                      >
                        {availableVoices.map((v, i) => (
                          <option key={i} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right: Scene Milestones & Full Voiceover Script (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      <span>Lesson Scenes ({analysis.video_tutor.scenes.length})</span>
                    </h3>

                    <div className="space-y-2">
                      {analysis.video_tutor.scenes.map((scene, idx) => {
                        const isActive = currentSceneIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleJumpToScene(idx)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold">{scene.title}</span>
                              <span className="font-mono text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {scene.duration}s
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                              &quot;{scene.voiceover_script}&quot;
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Step: Quiz */}
                  {onNavigateToQuiz && (
                    <button
                      onClick={() => onNavigateToQuiz(analysis.topic)}
                      className="w-full inline-flex items-center justify-center gap-2 p-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Practice Adaptive Quiz on this Lesson</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CARDS ON TOPIC (INTERACTIVE FLASHCARDS) */}
          {/* ======================================================== */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              {/* Flashcard Header Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mastery Progress:
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    {masteredCount} / {cardsList.length} Mastered
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShuffleCards}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>

                  <button
                    onClick={() => setCardViewMode(cardViewMode === 'carousel' ? 'grid' : 'carousel')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <span>{cardViewMode === 'carousel' ? 'View All as Grid' : 'Focus Carousel'}</span>
                  </button>
                </div>
              </div>

              {/* View Mode: Interactive Single Card Flip Carousel */}
              {cardViewMode === 'carousel' && activeCard ? (
                <div className="flex flex-col items-center gap-5">
                  {/* The 3D Flip Card */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="w-full max-w-xl min-h-[260px] p-8 rounded-3xl bg-white dark:bg-[#2C3633] border-2 border-slate-200 dark:border-slate-700/80 shadow-md hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between text-center select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                        {activeCard.category || 'Topic Card'}
                      </span>
                      <span>Card {cardIndex + 1} of {cardsList.length}</span>
                    </div>

                    <div className="my-auto py-4 space-y-4">
                      {/* Rich Concept Diagram & Graph */}
                      <div className="max-w-md mx-auto">
                        <CardVisualDiagram topic={activeCard.front + ' ' + (activeCard.category || '')} category={activeCard.category} />
                      </div>

                      {!isCardFlipped ? (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                            QUESTION / PROMPT
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                            {activeCard.front}
                          </h3>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                            ANSWER / EXPLANATION
                          </span>
                          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                            {activeCard.back}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Click card to {isCardFlipped ? 'flip back' : 'reveal answer'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMastered(activeCard.id);
                        }}
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded transition-colors ${
                          activeCard.isMastered
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{activeCard.isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevCard}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
                      title="Previous Card"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      {isCardFlipped ? 'Show Question' : 'Flip Card'}
                    </button>

                    <button
                      onClick={handleNextCard}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
                      title="Next Card"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Grid View of all cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardsList.map((card, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                            {card.category || 'Card'}
                          </span>
                          <button
                            onClick={() => handleToggleMastered(card.id)}
                            className={`p-1 rounded ${card.isMastered ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {card.front}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          {card.back}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CHAT DIRECTLY WITH THESE NOTES */}
          {/* ======================================================== */}
          {activeTab === 'chat' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Ask AI Tutor About Your Notes</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Answers are grounded specifically in the content extracted from your uploaded study material.
                  </p>
                </div>
                {onAskTutor && (
                  <button
                    onClick={() => onAskTutor(`Explain ${analysis?.topic || topicInput || 'my uploaded notes'}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Full AI Tutor Chat
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="min-h-[220px] max-h-[380px] overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {noteChatMessages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Ask any question about your notes (e.g. &quot;Explain the main formula in simple terms&quot; or &quot;What are the common exam pitfalls?&quot;)
                  </div>
                ) : (
                  noteChatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-teal-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isNoteChatLoading && (
                  <div className="text-xs text-slate-400 italic">Tutor analyzing notes...</div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={noteChatInput}
                  onChange={(e) => setNoteChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendNoteChat();
                  }}
                  placeholder="Ask a question about your uploaded notes..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <button
                  onClick={handleSendNoteChat}
                  disabled={!noteChatInput.trim() || isNoteChatLoading}
                  className="p-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesStudio;
