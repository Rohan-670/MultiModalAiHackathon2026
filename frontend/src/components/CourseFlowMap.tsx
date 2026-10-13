import React, { useState, useEffect } from 'react';
import {
  Network,
  ArrowRight,
  Layers,
  BookOpen,
  Video,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import type { CourseFlowData, CourseFlowNode, Citation } from '../types';

interface CourseFlowMapProps {
  onSelectCitation: (cit: Citation) => void;
  onAskTutor: (concept: string) => void;
}

export const CourseFlowMap: React.FC<CourseFlowMapProps> = ({
  onSelectCitation,
  onAskTutor,
}) => {
  const [flowData, setFlowData] = useState<CourseFlowData | null>(null);
  const [selectedNode, setSelectedNode] = useState<CourseFlowNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFlow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/course-flow');
      const data: CourseFlowData = await res.json();
      setFlowData(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (e) {
      console.error("Failed to load course flow", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlow();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Interactive Course Flow & Prerequisite Map</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual Directed Acyclic Graph (DAG) organizing curriculum topics into concepts, prerequisites, and mastery tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Needs Review
            </span>
          </div>

          <button
            onClick={fetchFlow}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors cursor-pointer"
            title="Refresh graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 animate-pulse">
          Building course prerequisite graph and overlaying Bayesian Knowledge Tracing states...
        </div>
      ) : !flowData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          No flow map data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: The Visual Graph Map */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Curriculum Progression Roadmap ({flowData.total_nodes} Key Concepts)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Prerequisite DAG View</span>
            </div>

            {/* Stages Grid */}
            <div className="space-y-6">
              {/* Stage 1: Foundations */}
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2.5">
                  Stage 1: Foundations & Formulation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flowData.nodes.slice(0, 2).map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-tight">{node.concept}</h4>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0"
                            style={{ backgroundColor: `${node.status_color}20`, color: node.status_color }}
                          >
                            {(node.mastery_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{node.description}</p>
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{node.citations[0]}</span>
                          <span className="capitalize">{node.origin_type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Downward Arrow */}
              <div className="flex justify-center -my-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
                  <span>Prerequisite Dependency Flow</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Stage 2: Core Dynamics & Algorithms */}
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2.5">
                  Stage 2: Core Optimization Dynamics & Backprop
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {flowData.nodes.slice(2, 5).map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-tight">{node.concept}</h4>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0"
                            style={{ backgroundColor: `${node.status_color}20`, color: node.status_color }}
                          >
                            {(node.mastery_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{node.description}</p>
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{node.citations[0]}</span>
                          <span className="capitalize">{node.origin_type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Downward Arrow */}
              <div className="flex justify-center -my-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
                  <span>Prerequisite Dependency Flow</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Stage 3: Advanced Accelerated Algorithms */}
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2.5">
                  Stage 3: High-Dimensional Landscapes & Accelerated Methods
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {flowData.nodes.slice(5).map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-tight">{node.concept}</h4>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0"
                            style={{ backgroundColor: `${node.status_color}20`, color: node.status_color }}
                          >
                            {(node.mastery_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{node.description}</p>
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{node.citations[0]}</span>
                          <span className="capitalize">{node.origin_type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Concept Inspector & Diagram Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-indigo-400 uppercase">{selectedNode.topic}</span>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: `${selectedNode.status_color}20`, color: selectedNode.status_color }}
                  >
                    {selectedNode.mastery_status} ({(selectedNode.mastery_score * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{selectedNode.concept}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
                </div>

                {/* Extracted Diagram / Figure preview */}
                {selectedNode.diagram && (
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedNode.diagram.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedNode.diagram.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      "{selectedNode.diagram.caption}"
                    </p>
                  </div>
                )}

                {/* Origin Citation Details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">Verified Source Origin:</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {selectedNode.origin_type === 'video' ? (
                        <Video className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <p className="font-medium text-white truncate max-w-[180px]">{selectedNode.source_name}</p>
                        <p className="text-[10px] text-cyan-400 font-mono">
                          {selectedNode.timestamp_str ? `@ ${selectedNode.timestamp_str}` : `Page ${selectedNode.page}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCitation({
                        tag: selectedNode.citations[0],
                        source_name: selectedNode.source_name,
                        source_type: selectedNode.origin_type,
                        timestamp_str: selectedNode.timestamp_str,
                        page: selectedNode.page,
                        snippet: selectedNode.description
                      })}
                      className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Jump</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => onAskTutor(`Explain ${selectedNode.concept} in detail using course citations.`)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Tutor About This</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                Select a concept node in the DAG to inspect details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
