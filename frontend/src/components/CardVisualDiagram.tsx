import React from 'react';

interface CardVisualDiagramProps {
  topic?: string;
  category?: string;
  className?: string;
}

export const CardVisualDiagram: React.FC<CardVisualDiagramProps> = ({
  topic = '',
  category = '',
  className = ''
}) => {
  const t = (topic + ' ' + category).toLowerCase();

  // 1. Neural Network / Backpropagation / Deep Learning
  if (t.includes('neural') || t.includes('backprop') || t.includes('deep') || t.includes('layer') || t.includes('transformer') || t.includes('attention')) {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 border border-indigo-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-indigo-300 pb-2 border-b border-indigo-900/50">
          <span>NEURAL NETWORK TOPOLOGY</span>
          <span className="bg-indigo-900/70 px-1.5 py-0.5 rounded text-indigo-200">FORWARD & BACKPROP</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Synapses (Connections) */}
          <line x1="40" y1="35" x2="160" y2="25" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="40" y1="35" x2="160" y2="65" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="40" y1="35" x2="160" y2="105" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.3" />

          <line x1="40" y1="95" x2="160" y2="25" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.3" />
          <line x1="40" y1="95" x2="160" y2="65" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="40" y1="95" x2="160" y2="105" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.5" />

          <line x1="160" y1="25" x2="280" y2="65" stroke="#10b981" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="160" y1="65" x2="280" y2="65" stroke="#10b981" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="160" y1="105" x2="280" y2="65" stroke="#10b981" strokeWidth="1.4" strokeOpacity="0.6" />

          {/* Input Layer */}
          <circle cx="40" cy="35" r="14" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
          <text x="40" y="39" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">x₁</text>

          <circle cx="40" cy="95" r="14" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
          <text x="40" y="99" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">x₂</text>

          {/* Hidden Layer */}
          <circle cx="160" cy="25" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="160" y="29" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="bold">h₁</text>

          <circle cx="160" cy="65" r="15" fill="#0f172a" stroke="#22d3ee" strokeWidth="2.5" />
          <text x="160" y="69" textAnchor="middle" fill="#a5f3fc" fontSize="9" fontWeight="bold">σ(W)</text>

          <circle cx="160" cy="105" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="160" y="109" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="bold">h₃</text>

          {/* Output Node */}
          <circle cx="280" cy="65" r="16" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
          <text x="280" y="69" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">ŷ</text>
        </svg>
        <span className="text-[10px] text-slate-300 font-sans">Multi-layer forward propagation & gradient backpropagation</span>
      </div>
    );
  }

  // 2. Learning Rate / Oscillation / Convergence
  if (t.includes('learning rate') || t.includes('tuning') || t.includes('convergence') || t.includes('loss') || t.includes('rate')) {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 border border-teal-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-teal-300 pb-2 border-b border-teal-900/50">
          <span>LOSS DYNAMICS GRAPH</span>
          <span className="bg-teal-900/70 px-1.5 py-0.5 rounded text-teal-200">OPTIMAL vs DIVERGENT</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="30" y1="110" x2="300" y2="110" stroke="#64748b" strokeWidth="1.5" />
          <line x1="30" y1="110" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
          <text x="300" y="122" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">Iteration (t)</text>
          <text x="25" y="18" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">Loss J(θ)</text>

          {/* Optimal Convergence Curve (Green) */}
          <path d="M 35 25 Q 70 75 140 98 T 290 106" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="290" cy="106" r="3.5" fill="#10b981" />
          <text x="210" y="94" fill="#34d399" fontSize="8" fontWeight="bold">Optimal α (Converges)</text>

          {/* Divergent High Rate (Red/Orange Oscillating) */}
          <path d="M 35 30 L 75 90 L 115 20 L 160 105 L 205 10 L 250 115" fill="none" stroke="#f87171" strokeWidth="1.8" strokeDasharray="3 3" />
          <text x="200" y="32" fill="#f87171" fontSize="8" fontWeight="bold">High α (Oscillation)</text>
        </svg>
        <span className="text-[10px] text-slate-300 font-sans">Stable parameter convergence vs high-frequency overshoot</span>
      </div>
    );
  }

  // 3. Momentum & Vectors / Velocity Dampening
  if (t.includes('momentum') || t.includes('vector') || t.includes('velocity') || t.includes('gradient') || t.includes('optimization')) {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-4 border border-cyan-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-cyan-300 pb-2 border-b border-cyan-900/50">
          <span>OPTIMIZATION CONTOUR & DESCENT</span>
          <span className="bg-cyan-900/70 px-1.5 py-0.5 rounded text-cyan-200">VALLEY TRAJECTORY</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ravine Contours */}
          <ellipse cx="160" cy="65" rx="140" ry="50" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
          <ellipse cx="160" cy="65" rx="100" ry="34" stroke="#475569" strokeWidth="1.2" />
          <ellipse cx="160" cy="65" rx="60" ry="20" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.6" />
          <ellipse cx="160" cy="65" rx="20" ry="8" stroke="#06b6d4" strokeWidth="2" fill="#083344" />
          <circle cx="160" cy="65" r="3" fill="#22d3ee" />

          {/* Standard SGD Bouncing Line (Orange) */}
          <path d="M 40 30 L 70 95 L 105 40 L 135 85 L 160 65" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Momentum Accelerated Smooth Path (Cyan Glow) */}
          <path d="M 40 30 Q 90 70 125 63 T 160 65" fill="none" stroke="#22d3ee" strokeWidth="3" />
          <circle cx="40" cy="30" r="3.5" fill="#38bdf8" />
          <circle cx="160" cy="65" r="4.5" fill="#22c55e" />

          <text x="50" y="24" fill="#38bdf8" fontSize="8" fontWeight="bold">Start θ₀</text>
          <text x="175" y="68" fill="#4ade80" fontSize="8" fontWeight="bold">Min θ*</text>
          <text x="80" y="112" fill="#fb923c" fontSize="7">SGD Oscillations</text>
          <text x="170" y="98" fill="#22d3ee" fontSize="7" fontWeight="bold">Momentum Smoothed</text>
        </svg>
        <span className="text-[10px] text-slate-300 font-sans">Momentum dampens high-curvature perpendicular fluctuations</span>
      </div>
    );
  }

  // 4. Decision Boundary / Classification / SVM
  if (t.includes('regression') || t.includes('svm') || t.includes('decision') || t.includes('tree') || t.includes('cluster') || t.includes('data')) {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 border border-emerald-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-emerald-300 pb-2 border-b border-emerald-900/50">
          <span>DECISION BOUNDARY & MARGIN</span>
          <span className="bg-emerald-900/70 px-1.5 py-0.5 rounded text-emerald-200">CLASSIFICATION HYPERPLANE</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid */}
          <line x1="30" y1="110" x2="300" y2="110" stroke="#475569" strokeWidth="1" />
          <line x1="30" y1="110" x2="30" y2="15" stroke="#475569" strokeWidth="1" />

          {/* Optimal Margin Separator */}
          <line x1="60" y1="115" x2="260" y2="15" stroke="#10b981" strokeWidth="2.5" />
          <line x1="85" y1="115" x2="285" y2="15" stroke="#059669" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="35" y1="115" x2="235" y2="15" stroke="#059669" strokeWidth="1" strokeDasharray="3 3" />

          {/* Class A Points (Teal/Emerald Circles) */}
          <circle cx="80" cy="50" r="4" fill="#34d399" />
          <circle cx="100" cy="35" r="4" fill="#34d399" />
          <circle cx="130" cy="25" r="4" fill="#34d399" />
          <circle cx="110" cy="70" r="4" fill="#34d399" />
          <circle cx="150" cy="45" r="4" fill="#34d399" />

          {/* Class B Points (Purple/Pink Squares) */}
          <rect x="180" y="80" width="8" height="8" rx="1.5" fill="#f43f5e" />
          <rect x="210" y="65" width="8" height="8" rx="1.5" fill="#f43f5e" />
          <rect x="230" y="95" width="8" height="8" rx="1.5" fill="#f43f5e" />
          <rect x="260" y="70" width="8" height="8" rx="1.5" fill="#f43f5e" />
          <rect x="200" y="100" width="8" height="8" rx="1.5" fill="#f43f5e" />

          <text x="60" y="25" fill="#34d399" fontSize="8" fontWeight="bold">Class +1</text>
          <text x="240" y="112" fill="#fb7185" fontSize="8" fontWeight="bold">Class -1</text>
          <text x="145" y="90" fill="#a7f3d0" fontSize="7" transform="rotate(-28 145 90)">Margin Boundary</text>
        </svg>
        <span className="text-[10px] text-slate-300 font-sans">Maximum separating margin between feature classes</span>
      </div>
    );
  }

  // 5. Physics / Waves / Harmonic / Thermodynamics
  if (t.includes('physics') || t.includes('wave') || t.includes('thermo') || t.includes('force') || t.includes('energy') || t.includes('quantum')) {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-4 border border-amber-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-amber-300 pb-2 border-b border-amber-900/50">
          <span>PHYSICAL DYNAMICS & OSCILLATION</span>
          <span className="bg-amber-900/70 px-1.5 py-0.5 rounded text-amber-200">WAVE HARMONICS</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Center Axis */}
          <line x1="20" y1="65" x2="300" y2="65" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" />

          {/* Damped Wave (Golden Amber) */}
          <path d="M 25 65 Q 55 10 90 65 T 155 65 T 220 65 T 285 65" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 25 65 Q 55 30 90 65 T 155 65 T 220 65 T 285 65" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Peak Indicators */}
          <circle cx="58" cy="37" r="3" fill="#fbbf24" />
          <circle cx="123" cy="93" r="3" fill="#fbbf24" />
          <line x1="58" y1="37" x2="58" y2="65" stroke="#f59e0b" strokeWidth="1" strokeDasharray="1 2" />
          <text x="64" y="52" fill="#fde68a" fontSize="8">Amplitude A</text>
          <text x="180" y="45" fill="#fde68a" fontSize="8" fontFamily="monospace">λ = v / f</text>
        </svg>
        <span className="text-[10px] text-slate-300 font-sans">Harmonic waveform propagation, period, and equilibrium restore</span>
      </div>
    );
  }

  // 6. Default Conceptual Diagram & Relationship Map
  return (
    <div className={`w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 border border-teal-500/30 text-white shadow-inner flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-between w-full text-[10px] font-mono text-teal-300 pb-2 border-b border-teal-900/50">
        <span>CONCEPTUAL RELATIONSHIP FLOW</span>
        <span className="bg-teal-900/70 px-1.5 py-0.5 rounded text-teal-200">CORE ARCHITECTURE</span>
      </div>
      <svg viewBox="0 0 320 130" className="w-full max-h-32 my-1" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Central Concept Node */}
        <rect x="110" y="15" width="100" height="30" rx="8" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.8" />
        <text x="160" y="34" textAnchor="middle" fill="#ccfbf1" fontSize="9" fontWeight="bold">CORE PRINCIPLE</text>

        {/* Connectors */}
        <path d="M 160 45 L 160 62 L 60 62 L 60 78" stroke="#14b8a6" strokeWidth="1.5" />
        <path d="M 160 45 L 160 78" stroke="#14b8a6" strokeWidth="1.5" />
        <path d="M 160 45 L 160 62 L 260 62 L 260 78" stroke="#14b8a6" strokeWidth="1.5" />

        {/* Child Node 1 */}
        <rect x="15" y="80" width="90" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="60" y="97" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="semibold">Mathematical Rule</text>

        {/* Child Node 2 */}
        <rect x="115" y="80" width="90" height="28" rx="6" fill="#1e293b" stroke="#a855f7" strokeWidth="1.2" />
        <text x="160" y="97" textAnchor="middle" fill="#e9d5ff" fontSize="8" fontWeight="semibold">System Derivation</text>

        {/* Child Node 3 */}
        <rect x="215" y="80" width="90" height="28" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.2" />
        <text x="260" y="97" textAnchor="middle" fill="#a7f3d0" fontSize="8" fontWeight="semibold">Application & Case</text>
      </svg>
      <span className="text-[10px] text-slate-300 font-sans">Hierarchical concept mapping and fundamental dependencies</span>
    </div>
  );
};
