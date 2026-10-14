import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Network,
  BookmarkCheck,
  Globe,
  Sun,
  Moon,
  Video,
  LayoutDashboard,
  FolderOpen,
  LogOut,
  LogIn,
  FileText,
  Database,
  Menu,
  X,
  Target
} from 'lucide-react';
import type { Language, LearnerProfile, UserProfile } from '../types';

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'notes'
  | 'chat'
  | 'video'
  | 'quiz'
  | 'flow'
  | 'learner'
  | 'revision'
  | 'evaluation'
  | 'report'
  | 'library';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openDrawer: () => void;
  sourceCount: number;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  learnerProfile?: LearnerProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openDrawer,
  sourceCount,
  selectedLanguage,
  onSelectLanguage,
  learnerProfile,
  theme,
  onToggleTheme,
  user,
  onOpenAuthModal,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'quiz', label: 'MARKS Custom Test', icon: Target },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes Studio', icon: FileText },
    { id: 'chat', label: 'Tutor Chat', icon: BookOpen },
    { id: 'video', label: 'Video Tutor', icon: Video },
    { id: 'revision', label: 'Study Cards', icon: BookmarkCheck },
    { id: 'flow', label: 'Course Map', icon: Network },
    { id: 'library', label: 'Library', icon: FolderOpen }
  ] as const;

  const masteryPct = learnerProfile?.average_mastery_pct ?? 54.8;

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#202725]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="LearnSphere AI - Click to view Overview"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-700 dark:bg-teal-600 flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>LearnSphere</span>
                <span className="text-teal-700 dark:text-teal-400 font-mono text-xs bg-teal-50 dark:bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-300 dark:border-teal-800">
                  AI
                </span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                MARKS Prep
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              Targeted Exam Assessment & Practice
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: BKT Indicator, Language, Theme, User Auth, Drawer */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Landing Page / App Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'landing' ? 'dashboard' : 'landing')}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-800 dark:text-teal-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <span>{activeTab === 'landing' ? 'App Workspace' : 'Overview'}</span>
          </button>

          {/* BKT Mastery Indicator Pill */}
          <div
            onClick={() => setActiveTab('learner')}
            className="cursor-pointer hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-mono shadow-xs hover:border-emerald-500 transition-all"
            title="Current BKT Course Mastery Level"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">BKT: {masteryPct}%</span>
          </div>

          {/* Multilingual Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 gap-1 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Select Tutoring Explanation Language"
            >
              <option value="English" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">English</option>
              <option value="Hinglish" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Hinglish 🇮🇳</option>
              <option value="Hindi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Hindi</option>
              <option value="Spanish" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Spanish</option>
            </select>
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Sources Drawer Toggle */}
          <button
            onClick={openDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title="Open Ingested Course Material Drawer"
          >
            <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline font-medium">Sources</span>
            <span className="bg-teal-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-teal-800 dark:text-teal-300 font-mono font-bold">
              {sourceCount}
            </span>
          </button>

          {/* User Auth Control */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.full_name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[100px]">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
