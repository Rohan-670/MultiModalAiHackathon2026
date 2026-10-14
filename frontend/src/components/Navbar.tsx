import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
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
  Target,
  Edit3,
  ChevronDown
} from 'lucide-react';
import type { Language, LearnerProfile, UserProfile } from '../types';
import { getTranslation, LANGUAGE_OPTIONS } from '../i18n';

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'personalize'
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
  theme,
  onToggleTheme,
  user,
  onOpenAuthModal,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const t = getTranslation(selectedLanguage);

  // Strictly 4 core buttons at the top
  const primaryNavItems = [
    { id: 'dashboard' as NavTab, label: t.tabDashboard, icon: LayoutDashboard },
    { id: 'notes' as NavTab, label: t.tabNotes, icon: FileText },
    { id: 'quiz' as NavTab, label: t.tabQuiz, icon: Target },
    { id: 'chat' as NavTab, label: t.tabChat, icon: BookOpen }
  ];

  // Secondary items cleanly organized in the "More" dropdown
  const secondaryNavItems = [
    { id: 'personalize' as NavTab, label: t.tabPersonalize, icon: Edit3 },
    { id: 'revision' as NavTab, label: t.tabRevision, icon: BookmarkCheck },
    { id: 'video' as NavTab, label: t.tabVideo, icon: Video },
    { id: 'library' as NavTab, label: t.tabLibrary, icon: FolderOpen }
  ];

  const isSecondaryActive = secondaryNavItems.some(item => item.id === activeTab);
  const activeSecondaryItem = secondaryNavItems.find(item => item.id === activeTab);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#202725]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo - Clean, without "MARKS Prep" or exam tags */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="LearnSphere AI"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 dark:bg-teal-600 flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                {t.brand}
              </h1>
              <span className="text-teal-700 dark:text-teal-400 font-mono text-[11px] bg-teal-50 dark:bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-300 dark:border-teal-800 font-bold">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs: Strictly 4 visible buttons + More dropdown */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 relative">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMoreDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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

          {/* Sleek "More" Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSecondaryActive
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/50'
              }`}
              title="More Features"
            >
              <span>{isSecondaryActive && activeSecondaryItem ? activeSecondaryItem.label : 'More'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMoreDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2C3633] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-40 animate-fadeIn">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-teal-700 dark:bg-teal-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Tools: Language, Theme, User Auth, Drawer */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Multilingual Selector - All Languages */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 gap-1 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none font-medium"
              title="Select Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {opt.flag} {opt.native}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title={t.sourcesLabel}
          >
            <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-medium">{t.sourcesLabel}</span>
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
                title={t.signOut}
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
              <span className="hidden sm:inline">{t.signIn}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Main Menu
            </div>
            <div className="grid grid-cols-2 gap-2">
              {primaryNavItems.map((item) => {
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
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              More Tools
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {secondaryNavItems.map((item) => {
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
          </div>
        </div>
      )}
    </header>
  );
};
