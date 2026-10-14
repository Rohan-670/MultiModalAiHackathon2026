import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Upload,
  Calendar,
  X,
  Check,
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';
import type { Language, PersonalNote, UserProfile } from '../types';
import { getTranslation } from '../i18n';
import { getStarterNotesForProfile } from '../starterNotes';

interface PersonalizeNotesProps {
  user: UserProfile | null;
  language: Language;
  onGenerateQuizFromNote: (topic: string, noteContent: string) => void;
  onStudyWithAI: (topic: string, noteContent: string) => void;
  onOpenOnboarding?: () => void;
}

export const PersonalizeNotes: React.FC<PersonalizeNotesProps> = ({
  user,
  language,
  onGenerateQuizFromNote,
  onStudyWithAI,
  onOpenOnboarding
}) => {
  const t = getTranslation(language);

  // Storage key is strictly isolated per logged-in user to prevent sharing notes
  const userKey = user ? `user_${user.id || user.email}` : 'guest';
  const storageKey = `learnsphere_notes_${userKey}`;

  // Load notes strictly from active user's local storage partition
  const [notes, setNotes] = useState<PersonalNote[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
    // New user with class profile gets starter notes; otherwise empty clean slate
    if (user?.class_grade && user?.target_subject) {
      return getStarterNotesForProfile(user.class_grade, user.target_subject);
    }
    return [];
  });

  // Re-sync whenever user account switches (e.g. login as another user or logout)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved notes on user switch", e);
      }
    }
    if (user?.class_grade && user?.target_subject) {
      const starters = getStarterNotesForProfile(user.class_grade, user.target_subject);
      setNotes(starters);
      localStorage.setItem(storageKey, JSON.stringify(starters));
    } else {
      setNotes([]);
    }
  }, [storageKey, user?.class_grade, user?.target_subject]);

  // Persist notes to active user's storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  // Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science & AI');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: PersonalNote = {
      id: `note_${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General Studies',
      content: newContent.trim(),
      createdAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: newTags ? newTags.split(',').map(s => s.trim()).filter(Boolean) : [newSubject.trim()]
    };

    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAddingNote(false);
    showNotification('Note added successfully!');
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      setNotes(notes.filter(n => n.id !== id));
      showNotification('Note deleted.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || n.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(notes.map(n => n.subject)));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>{t.notesSavedCount}: {notes.length}</span>
            </span>

            {user?.class_grade && (
              <span className="px-2.5 py-1 rounded-full bg-teal-950/40 text-teal-200 text-xs font-semibold border border-teal-500/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{user.class_grade}</span>
              </span>
            )}

            {user?.target_subject && (
              <span className="px-2.5 py-1 rounded-full bg-teal-950/40 text-teal-200 text-xs font-semibold border border-teal-500/30">
                {user.target_subject}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.personalizeTitle}
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            {user ? `${user.full_name}'s dedicated personal notebook. Manage your class notes, generate instant quizzes, or study with AI.` : t.personalizeDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 border border-teal-400/40 text-teal-100 font-semibold text-xs transition-all shadow-sm cursor-pointer"
              title="Change Academic Class or Subject"
            >
              <GraduationCap className="w-4 h-4 text-teal-300" />
              <span>{user?.class_grade ? 'Switch Class / Subject' : 'Set Class & Subject'}</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-all shadow-md cursor-pointer"
          >
            {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingNote ? t.cancel : t.addNewNote}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Note Modal / Form */}
      {isAddingNote && (
        <form
          onSubmit={handleSaveNote}
          className="p-6 rounded-3xl bg-white dark:bg-[#2C3633] border-2 border-teal-600/40 shadow-xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{t.addNewNote}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.noteTitle} *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Backpropagation & Multivariable Chain Rule"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.noteSubject}
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Computer Science, Physics, Chemistry, History..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.noteContent} *
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-400 hover:underline cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload text / markdown file</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={6}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t.noteContentPlaceholder}
              className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. Neural Networks, Calculus, Review 2026"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.saveNote}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-[#2C3633] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubjectFilter === 'all'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.allSubjects}
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubjectFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedSubjectFilter === s
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 space-y-3.5 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto mb-1">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {user ? `No saved notes yet for ${user.full_name}` : 'Welcome to your Notes Workspace'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {user?.class_grade
              ? `Academic level: ${user.class_grade} • Subject: ${user.target_subject || 'General'}. You can generate foundational starter notes, write custom notes, or upload documents (PDF, PPT, JPG).`
              : 'Tell us your academic class and starting subject to generate your foundational study notes, or start writing your own.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user?.class_grade ? 'Generate Starter Notes for My Class' : 'Choose Class & Get Starter Notes'}</span>
              </button>
            )}
            <button
              onClick={() => setIsAddingNote(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNewNote}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#2C3633] border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/50 shadow-xs flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {note.subject}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{note.createdAt}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-sans">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Generate Quiz on Demand, Study with AI, Delete */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onGenerateQuizFromNote(note.title, note.content)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                    title={t.generateQuizFromNote}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="truncate">{t.generateQuizOnDemand}</span>
                  </button>

                  <button
                    onClick={() => onStudyWithAI(note.title, note.content)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="truncate">{t.studyWithAI}</span>
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:text-red-700 font-semibold transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.deleteNote}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
