import React, { useState, useEffect } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { PersonalizeNotes } from './components/PersonalizeNotes';
import { ChatInterface } from './components/ChatInterface';
import { NotesStudio } from './components/NotesStudio';
import { SourceViewer, VideoPlayerModule } from './components/SourceViewer';
import { CourseLibrary } from './components/CourseLibrary';
import { QuizModule } from './components/QuizModule';
import { LearnerModelView } from './components/LearnerModelView';
import { RevisionSuite } from './components/RevisionSuite';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { KnowledgeGapReport } from './components/KnowledgeGapReport';
import { SourceDrawer } from './components/SourceDrawer';
import { AuthModal } from './components/AuthModal';
import { AcademicOnboardingModal } from './components/AcademicOnboardingModal';
import { getStarterNotesForProfile } from './starterNotes';
import type { ChatMessage, Citation, SourceSummary, Language, LearnerProfile, UserProfile } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('learnsphere_language');
    return (saved as Language) || 'English';
  });
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [practiceTopic, setPracticeTopic] = useState<string>('Calculus & Optimization');

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('learnsphere_language', lang);
  };

  // Theme Management (Light / Dark with local persistence)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('learnsphere_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('learnsphere_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Restore authenticated user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const [activeCitation, setActiveCitation] = useState<Citation | null>({
    tag: "[Optimization Fundamentals @ 04:15]",
    source_name: "Optimization Fundamentals & Problem Solving",
    source_type: "video",
    timestamp_str: "04:15",
    start_seconds: 255,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    snippet: "If step size is set too large, gradient descent can overshoot the global minimum, bounce across ravine walls, and catastrophically diverge towards numerical infinity."
  });

  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message without "MARKS Prep"
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: "Welcome to LearnSphere! Build adaptive quizzes tailored to your study needs, practice questions across any subject, or ask conceptual questions with step-by-step derivations.",
      timestamp: "Just now",
      citations: [
        {
          tag: "[Curriculum Reference p. 14]",
          source_name: "Mathematics & Optimization Reference",
          source_type: "pdf",
          page: 14,
          snippet: "Continuous optimization and gradient descent: iterative first-order algorithms for finding extrema of convex and non-convex functions."
        }
      ],
      suggestedFollowups: [
        "Why does gradient descent oscillate if the learning rate is too large?",
        "Explain backpropagation using the multivariable chain rule.",
        "What is the difference between Momentum and SGD?"
      ]
    }
  ]);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error("Failed to fetch sources", e);
    }
  };

  const fetchLearnerProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/learner/profile', { headers });
      const data: LearnerProfile = await res.json();
      setLearnerProfile(data);
    } catch (e) {
      console.error("Failed to fetch learner profile", e);
    }
  };

  useEffect(() => {
    fetchSources();
    fetchLearnerProfile();
  }, []);

  const handleSendMessage = async (query: string, teachingStyle: string = "detailed") => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          teaching_style: teachingStyle,
          language: selectedLanguage,
          course_id: 'cs229-ml'
        })
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        isOffMaterial: data.is_off_material,
        language: data.language,
        citations: data.citations,
        suggestedFollowups: data.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.citations && data.citations.length > 0) {
        setActiveCitation(data.citations[0]);
      }

      fetchLearnerProfile();
    } catch (e) {
      console.error("Chat error", e);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error retrieving answers. Please make sure the backend is active.",
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setActiveCitation(citation);
    setActiveTab('chat');
  };

  const handleAskConcept = (concept: string) => {
    setActiveTab('chat');
    handleSendMessage(`Explain ${concept} step-by-step with citations.`);
  };

  const handlePracticeConcept = (concept?: string) => {
    if (concept) setPracticeTopic(concept);
    setActiveTab('quiz');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: 'assistant',
        text: "Chat session refreshed. Ask me any question grounded in your course materials, or practice with adaptive assessments!",
        timestamp: "Just now"
      }
    ]);
  };

  const handleAuthSuccess = (authedUser: UserProfile, _token: string) => {
    setUser(authedUser);
    fetchLearnerProfile();
    setActiveTab('dashboard');
    if (!authedUser.class_grade && !authedUser.onboarding_completed) {
      setTimeout(() => setIsOnboardingOpen(true), 350);
    }
  };

  const handleCompleteOnboarding = (classGrade: string, subject: string) => {
    const starterNotes = getStarterNotesForProfile(classGrade, subject);
    if (!user) {
      const guestUser: UserProfile = {
        id: Date.now(),
        email: 'student@learnsphere.ai',
        full_name: 'Enrolled Student',
        role: 'student',
        class_grade: classGrade,
        target_subject: subject,
        onboarding_completed: true
      };
      setUser(guestUser);
      localStorage.setItem('auth_user', JSON.stringify(guestUser));
      localStorage.setItem(`learnsphere_notes_user_${guestUser.id}`, JSON.stringify(starterNotes));
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      class_grade: classGrade,
      target_subject: subject,
      onboarding_completed: true
    };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));

    const userKey = `user_${user.id || user.email}`;
    const storageKey = `learnsphere_notes_${userKey}`;
    localStorage.setItem(storageKey, JSON.stringify(starterNotes));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const handleQuickDemoLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student@learnsphere.ai',
          password: 'learnsphere123'
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
        fetchLearnerProfile();
        setActiveTab('dashboard');
        if (!data.user.class_grade) {
          setTimeout(() => setIsOnboardingOpen(true), 350);
        }
      }
    } catch (err) {
      console.error("Quick demo login failed", err);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F3] dark:bg-[#202725] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-600 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDrawer={() => setIsDrawerOpen(true)}
        sourceCount={sources.length}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
        learnerProfile={learnerProfile}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* 1. Landing Page Overview */}
        {activeTab === 'landing' && (
          <LandingPage
            language={selectedLanguage}
            onGetStarted={() => setActiveTab('dashboard')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onQuickDemo={handleQuickDemoLogin}
          />
        )}

        {/* 2. Student Dashboard */}
        {activeTab === 'dashboard' && (
          <StudentDashboard
            user={user}
            learnerProfile={learnerProfile}
            language={selectedLanguage}
            onNavigateTab={setActiveTab}
            onAskConcept={handleAskConcept}
            onPracticeConcept={handlePracticeConcept}
          />
        )}

        {/* 2.5 Personalize Notes (Add & Delete Notes, Generate Quiz on Demand) */}
        {activeTab === 'personalize' && (
          <div className="py-2">
            <PersonalizeNotes
              user={user}
              language={selectedLanguage}
              onGenerateQuizFromNote={(topic) => {
                setPracticeTopic(topic);
                setActiveTab('quiz');
              }}
              onStudyWithAI={(_topic) => {
                setActiveTab('notes');
              }}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          </div>
        )}

        {/* 2.8 AI Notes Studio (Upload Notes, Important Points, Voiceover Video, Cards) */}
        {activeTab === 'notes' && (
          <div className="py-2">
            <NotesStudio
              user={user}
              language={selectedLanguage}
              onAskTutor={handleAskConcept}
              onNavigateToQuiz={handlePracticeConcept}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          </div>
        )}

        {/* 3. Tutor & Sources Grounded Workspace */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-100px)] min-h-[600px]">
            <div className="h-full overflow-hidden">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onSelectCitation={handleCitationClick}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={handleLanguageChange}
                onResetChat={handleResetChat}
              />
            </div>

            <div className="h-full overflow-hidden">
              <SourceViewer
                activeCitation={activeCitation}
                onCitationClick={handleCitationClick}
                onStartQuiz={handlePracticeConcept}
              />
            </div>
          </div>
        )}

        {/* 4. Video Tutor Player */}
        {activeTab === 'video' && (
          <div className="py-2">
            <VideoPlayerModule
              activeCitation={activeCitation}
              onCitationClick={handleCitationClick}
              onStartQuiz={handlePracticeConcept}
            />
          </div>
        )}

        {/* 5. Course Materials & Ingestion Pipeline */}
        {activeTab === 'library' && (
          <div className="py-2">
            <CourseLibrary
              onCitationClick={handleCitationClick}
              onRefreshSources={fetchSources}
            />
          </div>
        )}

        {/* 6. Adaptive Assessment & Quiz Studio */}
        {activeTab === 'quiz' && (
          <div className="py-2">
            <QuizModule
              onCitationClick={handleCitationClick}
              onNavigateToReport={() => setActiveTab('report')}
              onUpdateLearnerProfile={fetchLearnerProfile}
              initialTopic={practiceTopic}
            />
          </div>
        )}

        {/* 8. Learner Model Mastery Engine */}
        {activeTab === 'learner' && (
          <div className="py-2">
            <LearnerModelView
              onStartQuizOnConcept={() => {
                setActiveTab('quiz');
              }}
              onRefreshProfile={fetchLearnerProfile}
            />
          </div>
        )}

        {/* 9. Revision Suite (Visual Flashcards, Spoken Brief, Spaced Schedule) */}
        {activeTab === 'revision' && (
          <div className="py-2">
            <RevisionSuite
              language={selectedLanguage}
              onCitationClick={handleCitationClick}
            />
          </div>
        )}

        {/* 10. System Evaluation & Benchmarking */}
        {activeTab === 'evaluation' && (
          <div className="py-2">
            <EvaluationDashboard />
          </div>
        )}

        {/* 11. Knowledge Gap Analysis Report */}
        {activeTab === 'report' && (
          <div className="py-2">
            <KnowledgeGapReport
              onCitationClick={handleCitationClick}
              onNavigateToQuiz={() => setActiveTab('quiz')}
            />
          </div>
        )}
      </main>

      {/* Course Knowledge Base Source Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sources={sources}
        onSelectCitation={handleCitationClick}
        onRefreshSources={fetchSources}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
      />

      {/* Academic Level & Subject Onboarding Modal */}
      <AcademicOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onComplete={handleCompleteOnboarding}
        language={selectedLanguage}
      />
    </div>
  );
};

export default App;
