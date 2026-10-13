import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Video,
  BookOpen,
  Layers,
  ArrowRight,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { ChatMessage, Citation, Language } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string, teachingStyle?: string) => Promise<void>;
  isLoading: boolean;
  onSelectCitation: (citation: Citation) => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onResetChat?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectCitation,
  selectedLanguage,
  onSelectLanguage,
  onResetChat
}) => {
  const [input, setInput] = useState('');
  const [teachingStyle, setTeachingStyle] = useState<string>('detailed');
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition setup (Voice STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : (selectedLanguage === 'Spanish' ? 'es-ES' : 'en-US');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic start failed", e);
      }
    }
  };

  // Text-to-Speech (Audio playback for tutoring sessions)
  const toggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean citation badges from audio readout for natural spoken flow
    const cleanText = text.replace(/\[[^\]]+\]/g, '').replace(/###/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const query = input;
    setInput('');
    onSendMessage(query, teachingStyle);
  };

  const samplePrompts = [
    "Why does gradient descent oscillate if the learning rate is too large?",
    "Explain backpropagation using the multivariable chain rule.",
    "How does Momentum damp perpendicular oscillations in ravines?",
    "What is the capital of France? (Test off-material refusal)"
  ];

  // Helper to render text with clickable citation badges
  const renderMessageContent = (msg: ChatMessage) => {
    const citationRegex = /(\[[^\]]+(?:@\s*\d{1,2}:\d{2}|p\.\s*\d+|Slide\s*\d+)[^\]]*\])/g;
    const parts = msg.text.split(citationRegex);

    return (
      <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2">
        {parts.map((part, index) => {
          if (citationRegex.test(part)) {
            const matchingCitation = msg.citations?.find(c => c.tag === part) || {
              tag: part,
              source_name: part.includes('@') ? "CS229 Lecture 1" : "Course Materials",
              source_type: part.includes('@') ? "video" : (part.includes('Slide') ? "slides" : "pdf"),
              timestamp_str: part.match(/@\s*(\d{1,2}:\d{2})/)?.[1],
              start_seconds: (() => {
                const m = part.match(/@\s*(\d{1,2}):(\d{2})/);
                return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 45;
              })(),
              page: parseInt(part.match(/p\.\s*(\d+)/)?.[1] || "14"),
              slide_number: parseInt(part.match(/Slide\s*(\d+)/)?.[1] || "2"),
              snippet: "Directly referenced from curriculum materials."
            };

            const isVideo = part.includes('@');
            const isSlide = part.includes('Slide');

            return (
              <button
                key={index}
                onClick={() => onSelectCitation(matchingCitation as Citation)}
                className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold transition-all shadow-sm hover:scale-105 cursor-pointer border ${
                  isVideo
                    ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/60 text-indigo-300'
                    : isSlide
                    ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300'
                }`}
                title="Click to jump directly in the source viewer"
              >
                {isVideo ? (
                  <Video className="w-3 h-3 text-cyan-400" />
                ) : isSlide ? (
                  <Layers className="w-3 h-3 text-amber-400" />
                ) : (
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                )}
                <span>{part}</span>
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value as Language)}
            className="text-[10px] bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            title="Switch Language"
          >
            <option value="English">English</option>
            <option value="Hinglish">Hinglish 🇮🇳</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
          </select>

          <select
            value={teachingStyle}
            onChange={(e) => setTeachingStyle(e.target.value)}
            className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            title="Switch Pedagogical Teaching Style (Agent 3)"
          >
            <option value="detailed">Detailed Academic</option>
            <option value="step_by_step">Step-by-Step</option>
            <option value="simple">Plain English</option>
            <option value="worked_example">Worked Example</option>
            <option value="analogy">Intuitive Analogy</option>
            <option value="socratic">Socratic Method</option>
            <option value="diagram_assisted">Diagram-Assisted</option>
            <option value="exam_focused">Exam-Focused</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-slate-400">Strictly Source-Grounded RAG</span>
          {onResetChat && (
            <button
              onClick={onResetChat}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Start Your Interactive Study Session</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Ask any question about neural networks or optimization. Every answer is grounded in lecture video timestamps and textbook pages.
              </p>
            </div>

            {/* Quick Demo Prompts */}
            <div className="w-full max-w-md space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
                Suggested Demo Questions:
              </p>
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 transition-all flex items-center justify-between group hover:border-indigo-500/50 cursor-pointer"
                >
                  <span className="truncate mr-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-4 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : msg.isOffMaterial
                    ? 'bg-amber-950/40 border border-amber-500/60 text-slate-100 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Header label & TTS Audio Voice button */}
                <div className="flex items-center justify-between mb-2 text-[11px] opacity-75">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">
                      {msg.sender === 'user' ? 'You' : 'Adaptive AI Tutor'}
                    </span>
                    {msg.isOffMaterial && (
                      <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/40 font-mono">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Off-Material Query
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => toggleSpeak(msg.id, msg.text)}
                        className={`p-1 rounded hover:bg-slate-700/80 transition-colors ${
                          currentlySpeakingId === msg.id ? 'text-indigo-400 animate-pulse' : 'text-slate-400'
                        }`}
                        title="Listen to audio explanation"
                      >
                        {currentlySpeakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Rendered Body with clickable citations */}
                {renderMessageContent(msg)}

                {/* Grounding Source Drawer Pills */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Verified Sources Cited (Click to Jump Player / Document):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectCitation(c)}
                          className="text-[11px] px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          {c.source_type === 'video' ? (
                            <Video className="w-3 h-3 text-indigo-400" />
                          ) : c.source_type === 'slides' ? (
                            <Layers className="w-3 h-3 text-amber-400" />
                          ) : (
                            <BookOpen className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className="font-mono text-cyan-300">
                            {c.timestamp_str ? `@ ${c.timestamp_str}` : c.slide_number ? `Slide ${c.slide_number}` : `p. ${c.page}`}
                          </span>
                          <span className="truncate max-w-[120px]">{c.source_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested follow-up queries */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Recommended Practice Checks:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedFollowups.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSendMessage(q)}
                          className="text-left text-xs text-indigo-300 hover:text-indigo-200 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="text-indigo-400">•</span>
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 max-w-md animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="text-xs text-slate-300">
              Retrieving multimodal course chunks & verifying inline citations...
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Form with Voice STT microphone button */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-800/90 border-t border-slate-700/80">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to voice input..." : "Ask about gradient descent, backprop, learning rate..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-1.5 rounded-lg border transition-all ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
            title={isListening ? "Stop voice listening" : "Click to speak query (Voice STT)"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
