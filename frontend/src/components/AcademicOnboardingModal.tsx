import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { CLASS_LEVELS, SUBJECT_OPTIONS } from '../starterNotes';
import type { Language, UserProfile } from '../types';

interface AcademicOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onComplete: (classGrade: string, subject: string) => void;
  language?: Language;
}

export const AcademicOnboardingModal: React.FC<AcademicOnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  onComplete,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(user?.class_grade || CLASS_LEVELS[2]); // Default Class 11
  const [selectedSubject, setSelectedSubject] = useState<string>(user?.target_subject || SUBJECT_OPTIONS[0].name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(selectedClass, selectedSubject);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-[#2C3633] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalize Your Academic Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.full_name ? `Welcome, ${user.full_name}! ` : 'Welcome! '}
                Select your class and starting subject to generate your foundational notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Academic Class / Grade Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              1. Select Your Academic Level / Class
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLASS_LEVELS.map((level) => {
                const isSelected = selectedClass === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSelectedClass(level)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{level}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target Subject Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              2. Choose Starting Subject
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUBJECT_OPTIONS.map((subj) => {
                const isSelected = selectedSubject === subj.name;
                return (
                  <button
                    type="button"
                    key={subj.id}
                    onClick={() => setSelectedSubject(subj.name)}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{subj.icon}</span>
                    <span className="flex-1 font-bold">{subj.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer & Submit */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
              You can upload your own notes or switch subjects anytime later.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Setting Up...' : 'Generate Starter Notes'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
