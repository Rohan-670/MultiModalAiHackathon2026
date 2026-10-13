import React, { useState, useEffect } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { ChatInterface } from './components/ChatInterface';
import { NotesStudio } from './components/NotesStudio';
import { SourceViewer, VideoPlayerModule } from './components/SourceViewer';
import { CourseLibrary } from './components/CourseLibrary';
import { QuizModule } from './components/QuizModule';
import { CourseFlowMap } from './components/CourseFlowMap';
import { LearnerModelView } from './components/LearnerModelView';
import { RevisionSuite } from './components/RevisionSuite';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { KnowledgeGapReport } from './components/KnowledgeGapReport';
import { SourceDrawer } from './components/SourceDrawer';
import { AuthModal } from './components/AuthModal';
import type { ChatMessage, Citation, SourceSummary, Language, LearnerProfile, UserProfile } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [practiceTopic, setPracticeTopic] = useState<string>('Gradient Descent & Optimization');

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
    tag: "[CS229 Lecture 1 @ 04:15]",
    source_name: "CS229 Lecture 1 - Optimization Fundamentals",
    source_type: "video",
    timestamp_str: "04:15",
    start_seconds: 255,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    snippet: "If alpha is set too large, gradient descent can overshoot the global minimum, bounce across ravine walls, and catastrophically diverge towards numerical infinity."
  });

  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message with working demo citation badges
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: "Welcome to LearnSphere AI! I am strictly grounded in your lecture videos, textbooks, and slide decks. Ask me any question, select a teaching style (Socratic, Worked Example, Step-by-Step), or click any citation badge like [CS229 Lecture 1 @ 04:15] to jump the video player or preview the textbook.",
      timestamp: "Just now",
      citations: [
        {
          tag: "[CS229 Lecture 1 @ 04:15]",
          source_name: "CS229 Lecture 1 - Optimization Fundamentals",
          source_type: "video",
          timestamp_str: "04:15",
          start_seconds: 255,
          snippet: "If alpha is set too large, gradient descent can overshoot the global minimum, bounce across ravine walls, and catastrophically diverge towards numerical infinity."
        },
        {
          tag: "[Deep Learning Textbook p. 14]",
          source_name: "Deep Learning Textbook (Goodfellow)",
          source_type: "pdf",
          page: 14,
          snippet: "Chapter 4: Numerical Computation. Most deep learning algorithms involve continuous optimization. Gradient descent is an iterative first-order optimization algorithm for finding a local minimum."
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

      // Automatically sync the first citation in response to Source Viewer if available
      if (data.citations && data.citations.length > 0) {
        setActiveCitation(data.citations[0]);
      }

      // Update learner model if conversation updated it
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
        onSelectLanguage={setSelectedLanguage}
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
            onNavigateTab={setActiveTab}
            onAskConcept={handleAskConcept}
            onPracticeConcept={handlePracticeConcept}
          />
        )}

        {/* 2.5 AI Notes Studio (Upload Notes, Important Points, Voiceover Video, Cards) */}
        {activeTab === 'notes' && (
          <div className="py-2">
            <NotesStudio
              onAskTutor={handleAskConcept}
              onNavigateToQuiz={handlePracticeConcept}
            />
          </div>
        )}

        {/* 3. Tutor & Sources Grounded Workspace */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-100px)] min-h-[600px]">
            {/* Left: Chat Interface with Voice STT/TTS & Off-material alerts */}
            <div className="h-full overflow-hidden">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onSelectCitation={handleCitationClick}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
                onResetChat={handleResetChat}
              />
            </div>

            {/* Right: Click-to-Jump Source Viewer (Video, PDF, Figures) */}
            <div className="h-full overflow-hidden">
              <SourceViewer
                activeCitation={activeCitation}
                onCitationClick={handleCitationClick}
                onStartQuiz={handlePracticeConcept}
              />
            </div>
          </div>
        )}

        {/* 4. Video Tutor Player (3 Pedagogical Styles) */}
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

        {/* 6. MARKS Custom Assessment Module */}
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

        {/* 7. Course Flow Map DAG */}
        {activeTab === 'flow' && (
          <div className="py-2">
            <CourseFlowMap
              onSelectCitation={handleCitationClick}
              onAskTutor={handleAskConcept}
            />
          </div>
        )}

        {/* 8. Learner Model BKT Engine */}
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

        {/* 9. Revision Suite (Flashcards, Spoken Brief, Spaced Schedule) */}
        {activeTab === 'revision' && (
          <div className="py-2">
            <RevisionSuite
              onCitationClick={handleCitationClick}
            />
          </div>
        )}

        {/* 10. System Evaluation & RAGAS Benchmarking */}
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
      />
    </div>
  );
};

export default App;
