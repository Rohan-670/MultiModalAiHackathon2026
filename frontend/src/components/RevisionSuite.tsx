import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Headphones,
  Calendar,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Clock
} from 'lucide-react';
import { CardVisualDiagram } from './CardVisualDiagram';
import type { Flashcard, AudioBrief, StudyScheduleItem, Citation, Language } from '../types';
import { getTranslation } from '../i18n';

interface RevisionSuiteProps {
  onCitationClick: (cit: Citation) => void;
  language?: Language;
}

export const RevisionSuite: React.FC<RevisionSuiteProps> = ({ onCitationClick, language = 'English' }) => {
  const t = getTranslation(language);
  const [subTab, setSubTab] = useState<'flashcards' | 'audio' | 'schedule'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFcIdx, setCurrentFcIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fcLoading, setFcLoading] = useState(true);

  // Audio brief state
  const [audioBrief, setAudioBrief] = useState<AudioBrief | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [audioLoading, setAudioLoading] = useState(false);

  // Study schedule state
  const [examDays, setExamDays] = useState(7);
  const [schedule, setSchedule] = useState<StudyScheduleItem[]>([]);
  const [schedLoading, setSchedLoading] = useState(false);

  // Fetch flashcards on mount
  useEffect(() => {
    fetch('/api/revision/flashcards?count=5')
      .then(r => r.json())
      .then(d => {
        if (d.flashcards) setFlashcards(d.flashcards);
      })
      .finally(() => setFcLoading(false));
  }, []);

  // Fetch audio brief
  useEffect(() => {
    if (subTab === 'audio' && !audioBrief) {
      setAudioLoading(true);
      fetch('/api/revision/audio-brief')
        .then(r => r.json())
        .then(d => setAudioBrief(d))
        .finally(() => setAudioLoading(false));
    }
  }, [subTab, audioBrief]);

  const loadSchedule = async (days: number) => {
    setSchedLoading(true);
    try {
      const res = await fetch('/api/revision/study-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_until_exam: days })
      });
      const data = await res.json();
      if (data.schedule) setSchedule(data.schedule);
    } catch (e) {
      console.error("Schedule load failed", e);
    } finally {
      setSchedLoading(false);
    }
  };

  // Fetch schedule
  useEffect(() => {
    if (subTab === 'schedule' && schedule.length === 0) {
      loadSchedule(examDays);
    }
  }, [subTab, examDays, schedule.length]);

  // Audio brief Web Speech TTS playback
  const handleTogglePlayAudio = () => {
    if (!('speechSynthesis' in window) || !audioBrief) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanScript = audioBrief.script.replace(/\[[^\]]+\]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanScript);
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const currentCard = flashcards[currentFcIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{t.flashcardsTitle}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.flashcardsSubtitle}
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
          <button
            onClick={() => {
              handleStopAudio();
              setSubTab('flashcards');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'flashcards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>{t.tabRevision}</span>
          </button>
          <button
            onClick={() => setSubTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'audio' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Audio Brief</span>
          </button>
          <button
            onClick={() => {
              handleStopAudio();
              setSubTab('schedule');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'schedule' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Schedule</span>
          </button>
        </div>
      </div>

      {/* 1. Flashcards View */}
      {subTab === 'flashcards' && (
        <div className="space-y-4">
          {fcLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 animate-pulse">
              Generating active recall flashcards from prioritized course chunks...
            </div>
          ) : !currentCard ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No flashcards available.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Card {currentFcIdx + 1} of {flashcards.length}</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                  Concept: {currentCard.concept}
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all rounded-3xl p-8 sm:p-12 min-h-[300px] flex flex-col justify-between shadow-2xl cursor-pointer group select-none"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="uppercase font-mono text-[11px] text-indigo-400 font-bold">
                    {isFlipped ? "Answer & Verified Citation (Back)" : "Active Recall Question (Front)"}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    Click anywhere to flip
                  </span>
                </div>

                <div className="my-auto py-4 space-y-4">
                  {/* Visual Diagram / Graph */}
                  <div className="max-w-md mx-auto">
                    <CardVisualDiagram topic={currentCard.concept} category={currentCard.source_type} />
                  </div>

                  {!isFlipped ? (
                    <div className="text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        Active Recall Question
                      </span>
                      <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed max-w-xl mx-auto">
                        {currentCard.front}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-xl mx-auto text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Verified Explanation & Derivation
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                        {currentCard.back}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-xs">
                        <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Source: {currentCard.citation}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Source Type: {currentCard.source_type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitationClick({
                        tag: currentCard.citation,
                        source_name: "Course Materials",
                        source_type: currentCard.source_type,
                        snippet: currentCard.back
                      });
                    }}
                    className="text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>Jump to source passage</span>
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentFcIdx === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFcIdx(currentFcIdx - 1);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Card</span>
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Flip Card
                </button>

                <button
                  disabled={currentFcIdx === flashcards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFcIdx(currentFcIdx + 1);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next Card</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Audio Brief View */}
      {subTab === 'audio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">2-Minute AI Tutoring Audio Brief</h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Web Speech TTS Player
            </span>
          </div>

          {audioLoading || !audioBrief ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">
              Generating conversational audio synthesis script...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Audio Player Controller Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleTogglePlayAudio}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                      isPlaying
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div>
                    <h4 className="text-sm font-bold text-white">Topic: {audioBrief.topic}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Duration: ~{audioBrief.estimated_duration_seconds}s</span>
                      <span>•</span>
                      <span>{isPlaying ? 'Playing Audio...' : 'Ready to Play'}</span>
                    </p>
                  </div>
                </div>

                {/* Speed selector & stop */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Speed:</span>
                  {[1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        speechRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                  {isPlaying && (
                    <button
                      onClick={handleStopAudio}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white ml-2"
                      title="Stop audio"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Script Readout Box */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Spoken Narration Script:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  "{audioBrief.script}"
                </p>
              </div>

              {/* Citations cited in the brief */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Citations Spoken:</span>
                <div className="flex flex-wrap gap-1.5">
                  {audioBrief.audio_citations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => onCitationClick({
                        tag: c,
                        source_name: "Lecture Materials",
                        source_type: "video",
                        snippet: `Mentioned in ${audioBrief.topic} audio brief.`
                      })}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:text-white font-mono border border-slate-700 cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Study Schedule View */}
      {subTab === 'schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Adaptive Study Schedule Planner</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generates optimal revision intervals based on Ebbinghaus forgetting curves and exam target date.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">Days Until Exam:</span>
              <select
                value={examDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setExamDays(val);
                  loadSchedule(val);
                }}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={3}>3 Days (Crash Revision)</option>
                <option value={7}>7 Days (Standard Prep)</option>
                <option value={14}>14 Days (Comprehensive Mastery)</option>
              </select>
            </div>
          </div>

          {schedLoading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">
              Computing optimal spaced-repetition daily intervals...
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 shrink-0">
                      Day {item.day_number}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.topic}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.recommended_activity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        item.priority === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : item.priority === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 hidden sm:inline">
                      Goal: {item.target_mastery}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
