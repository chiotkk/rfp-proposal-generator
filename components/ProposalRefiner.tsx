import React, { useState } from 'react';
import { ProposalState, RFPAnalysis, BuildingBlock } from '../types';
import { BUILDING_BLOCKS } from '../constants';
import { tailorContent } from '../services/geminiService';
import { Wand2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { MarkdownEditor } from './MarkdownEditor';

interface ProposalRefinerProps {
  state: ProposalState;
  analysis: RFPAnalysis;
  onBack: () => void;
  onNext: (state: ProposalState) => void;
}

export const ProposalRefiner: React.FC<ProposalRefinerProps> = ({ state, analysis, onBack, onNext }) => {
  const [proposalState, setProposalState] = useState<ProposalState>(state);
  const [processingSections, setProcessingSections] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [globalProcessing, setGlobalProcessing] = useState(false);
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({});

  const sections = [
    { key: 'intro', label: 'Company Profile' },
    { key: 'scope', label: 'Proposed Scope' },
    { key: 'timeline', label: 'Timeline & Plan' },
    { key: 'qa', label: 'Quality Assurance' },
    { key: 'security', label: 'Security & Compliance' },
    { key: 'change_mgmt', label: 'Change Management' },
    { key: 'training', label: 'Training & Handover' },
    { key: 'deliverables', label: 'Deliverables' },
    { key: 'terms', label: 'Terms & Conditions' },
  ];

  // Helper to get current content for a section
  const getSectionContent = (sectionKey: string): { id: string, content: string, name: string } | null => {
    // @ts-ignore
    const blockId = proposalState[`${sectionKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase())}BlockId`];
    if (!blockId) return null;

    const block = BUILDING_BLOCKS.find(b => b.id === blockId);
    if (!block) return null;

    const content = proposalState.customContent[blockId] || block.content;
    return { id: blockId, content, name: block.name };
  };

  const handleTailorSection = async (sectionKey: string) => {
    const data = getSectionContent(sectionKey);
    if (!data) return;

    // Store original content if not already stored
    if (!originalContent[data.id]) {
        setOriginalContent(prev => ({
            ...prev,
            [data.id]: data.content
        }));
    }

    setProcessingSections(prev => [...prev, sectionKey]);
    
    try {
        const tailored = await tailorContent(data.content, analysis, sectionKey);
        
        setProposalState(prev => ({
            ...prev,
            customContent: {
                ...prev.customContent,
                [data.id]: tailored
            }
        }));
        
        setCompletedSections(prev => [...prev, sectionKey]);
    } catch (error) {
        console.error(`Failed to tailor ${sectionKey}`, error);
    } finally {
        setProcessingSections(prev => prev.filter(s => s !== sectionKey));
    }
  };

  const handleRevertSection = (sectionKey: string) => {
    const data = getSectionContent(sectionKey);
    if (!data || !originalContent[data.id]) return;

    setProposalState(prev => ({
        ...prev,
        customContent: {
            ...prev.customContent,
            [data.id]: originalContent[data.id]
        }
    }));

    setCompletedSections(prev => prev.filter(s => s !== sectionKey));
  };

  const handleTailorAll = async () => {
    setGlobalProcessing(true);
    const activeKeys = sections.filter(s => proposalState.activeSections[s.key]);
    
    // Process sequentially to avoid rate limits, or parallel if quota allows. 
    // Let's do parallel for speed but limit concurrency if needed. 
    // For now, simple parallel is fine for demo.
    
    const promises = activeKeys.map(async (section) => {
        if (!completedSections.includes(section.key)) {
            await handleTailorSection(section.key);
        }
    });

    await Promise.all(promises);
    setGlobalProcessing(false);
  };

  const updateContent = (blockId: string, newContent: string) => {
      setProposalState(prev => ({
          ...prev,
          customContent: {
              ...prev.customContent,
              [blockId]: newContent
          }
      }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
            <h1 className="text-xl font-semibold text-slate-800">Refine & Tailor</h1>
            <p className="text-sm text-slate-500">AI-powered refinement to match client requirements.</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Back
            </button>
            <button 
                onClick={() => onNext(proposalState)}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center"
            >
                Finalize & Preview <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar Controls */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col">
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Global Actions</h3>
                <p className="text-xs text-slate-500 mb-4">
                    Automatically rewrite all active sections to align with the RFP strategy and requirements.
                </p>
                <button 
                    onClick={handleTailorAll}
                    disabled={globalProcessing}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all
                        ${globalProcessing 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md'
                        }`}
                >
                    {globalProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4" />
                    )}
                    <span>{globalProcessing ? 'Tailoring All...' : 'Auto-Tailor Proposal'}</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Section Status</h3>
                <div className="space-y-3">
                    {sections.map(section => {
                        if (!proposalState.activeSections[section.key]) return null;
                        
                        const isProcessing = processingSections.includes(section.key);
                        const isCompleted = completedSections.includes(section.key);
                        
                        return (
                            <div key={section.key} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700">{section.label}</span>
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                                ) : isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {sections.map(section => {
                if (!proposalState.activeSections[section.key]) return null;
                const data = getSectionContent(section.key);
                if (!data) return null;

                const isProcessing = processingSections.includes(section.key);
                const isCompleted = completedSections.includes(section.key);

                return (
                    <div key={section.key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-800">{section.label}</h3>
                            <div className="flex items-center space-x-2">
                                {isCompleted && (
                                    <button
                                        onClick={() => handleRevertSection(section.key)}
                                        className="text-xs px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center space-x-1 transition-colors"
                                        title="Revert to original content"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Revert</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleTailorSection(section.key)}
                                    disabled={isProcessing}
                                    className={`text-xs px-3 py-1.5 rounded border flex items-center space-x-1 transition-colors
                                        ${isCompleted 
                                            ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300' 
                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-3 h-3" />
                                    )}
                                    <span>{isCompleted ? 'Re-Tailor' : 'Tailor'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-0">
                            <MarkdownEditor 
                                value={data.content}
                                onChange={(val) => updateContent(data.id, val)}
                            />
                        </div>
                        {isCompleted && (
                            <div className="px-6 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center text-xs text-emerald-700">
                                <CheckCircle2 className="w-3 h-3 mr-2" />
                                Content tailored to {analysis.clientName}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
