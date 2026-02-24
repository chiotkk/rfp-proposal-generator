import React, { useState } from 'react';
import { ProposalState, RFPAnalysis, Recommendations, BuildingBlock, PricingLineItem, LibraryBlock } from '../types';
import { BUILDING_BLOCKS } from '../constants';
import { analyzeRFP, recommendBlocks, tailorContent } from '../services/geminiService';
import { MarkdownEditor } from './MarkdownEditor';
import { Settings, Wand2, FileText, Users, Briefcase, Layout, CheckCircle2, ShieldCheck, Lock, GitMerge, GraduationCap, Info, Plus, Trash2, CheckSquare, Square, Library, ChevronDown } from 'lucide-react';

interface ProposalBuilderProps {
  analysis: RFPAnalysis;
  recommendations: Recommendations;
  onPreview: (state: ProposalState) => void;
  libraryBlocks: LibraryBlock[];
}

export const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ analysis, recommendations, onPreview, libraryBlocks }) => {
  
  const [tailoringBlockId, setTailoringBlockId] = useState<string | null>(null);

  // Helper to seed initial pricing based on AI recommendation
  const getInitialPricing = (recId: string): PricingLineItem[] => {
    if (recId === 'price-fix') {
        return [
            { id: '1', description: 'Project Fixed Fee (Design & Development)', unit: 'Lot', quantity: 1, unitCost: 75000, isOptional: false },
            { id: '2', description: 'Annual Maintenance Support', unit: 'Year', quantity: 1, unitCost: 12000, isOptional: true },
        ];
    } else {
        // Default to Time & Materials structure
        return [
            { id: '1', description: 'Senior Solutions Architect', unit: 'Hour', quantity: 40, unitCost: 180, isOptional: false },
            { id: '2', description: 'Senior Full Stack Developer', unit: 'Hour', quantity: 320, unitCost: 150, isOptional: false },
            { id: '3', description: 'UI/UX Designer', unit: 'Hour', quantity: 80, unitCost: 135, isOptional: false },
            { id: '4', description: 'Project Manager', unit: 'Hour', quantity: 60, unitCost: 140, isOptional: false },
            { id: '5', description: 'Post-Launch Hypercare (2 Weeks)', unit: 'Fixed', quantity: 1, unitCost: 5000, isOptional: true },
        ];
    }
  };

  const [proposalState, setProposalState] = useState<ProposalState>({
    introBlockId: recommendations.intro?.blockId || 'intro-std',
    timelineBlockId: recommendations.timeline?.blockId || 'time-std',
    scopeBlockId: recommendations.scope?.blockId || 'scope-std',
    pricingItems: getInitialPricing(recommendations.pricing?.blockId || 'price-tm'),
    termsBlockId: recommendations.terms?.blockId || 'terms-std',
    deliverablesBlockId: recommendations.deliverables?.blockId || 'del-std',
    teamBlockId: recommendations.team?.blockId || 'team-std',
    caseStudiesBlockIds: [recommendations.case_studies?.blockId || 'case-fintech'],
    qaBlockId: recommendations.qa?.blockId || 'qa-std',
    securityBlockId: recommendations.security?.blockId || 'sec-std',
    changeMgmtBlockId: recommendations.change_mgmt?.blockId || 'cm-agile',
    trainingBlockId: recommendations.training?.blockId || 'train-tt',
    activeSections: {
        intro: true,
        scope: true,
        timeline: true,
        deliverables: true,
        pricing: true,
        terms: true,
        team: true,
        case_studies: true,
        qa: true,
        security: true,
        change_mgmt: true,
        training: true
    },
    customContent: {}
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Categories definition
  const sections = [
    { key: 'intro', label: 'Company Profile', icon: FileText },
    { key: 'team', label: 'Team & Personnel', icon: Users },
    { key: 'case_studies', label: 'Case Studies', icon: Briefcase },
    { key: 'scope', label: 'Proposed Scope', icon: Layout },
    { key: 'timeline', label: 'Timeline & Plan', icon: CheckCircle2 },
    { key: 'qa', label: 'Quality Assurance', icon: ShieldCheck },
    { key: 'security', label: 'Security & Compliance', icon: Lock },
    { key: 'change_mgmt', label: 'Change Management', icon: GitMerge },
    { key: 'training', label: 'Training & Handover', icon: GraduationCap },
    { key: 'deliverables', label: 'Deliverables', icon: FileText },
    { key: 'pricing', label: 'Investment', icon: Info },
    { key: 'terms', label: 'Terms & Conditions', icon: FileText },
  ];

  const updateBlock = (key: string, id: string) => {
    // @ts-ignore - dynamic key access
    setProposalState(prev => ({ ...prev, [key]: id }));
  };

  const updateCustomContent = (blockId: string, content: string) => {
    setProposalState(prev => ({
        ...prev,
        customContent: {
            ...prev.customContent,
            [blockId]: content
        }
    }));
  };

  const toggleCaseStudy = (id: string) => {
    setProposalState(prev => {
        const currentIds = prev.caseStudiesBlockIds;
        if (currentIds.includes(id)) {
            return { ...prev, caseStudiesBlockIds: currentIds.filter(i => i !== id) };
        } else {
            return { ...prev, caseStudiesBlockIds: [...currentIds, id] };
        }
    });
  };

  const toggleSection = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProposalState(prev => ({
        ...prev,
        activeSections: {
            ...prev.activeSections,
            [key]: !prev.activeSections[key]
        }
    }));
  };

  // --- PRICING LOGIC ---
  const addPricingItem = () => {
      const newItem: PricingLineItem = {
          id: Math.random().toString(36).substr(2, 9),
          description: '',
          unit: 'Hour',
          quantity: 0,
          unitCost: 0,
          isOptional: false
      };
      setProposalState(prev => ({
          ...prev,
          pricingItems: [...prev.pricingItems, newItem]
      }));
  };

  const removePricingItem = (id: string) => {
      setProposalState(prev => ({
          ...prev,
          pricingItems: prev.pricingItems.filter(item => item.id !== id)
      }));
  };

  const updatePricingItem = (id: string, field: keyof PricingLineItem, value: any) => {
      setProposalState(prev => ({
          ...prev,
          pricingItems: prev.pricingItems.map(item => 
              item.id === id ? { ...item, [field]: value } : item
          )
      }));
  };

  const calculateTotals = () => {
      const items = proposalState.pricingItems;
      const baseTotal = items
          .filter(i => !i.isOptional)
          .reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
      
      const optionalTotal = items
          .filter(i => i.isOptional)
          .reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

      return { baseTotal, withOptionals: baseTotal + optionalTotal };
  };

  const getRecommendation = (category: string) => {
    // Safety check if recommendations is undefined or key is missing
    if (!recommendations || !(category in recommendations)) {
        return { blockId: '', reasoning: '' };
    }
    return (recommendations as any)[category];
  };

  const handleTailor = async (blockId: string, content: string, sectionName: string) => {
    setTailoringBlockId(blockId);
    try {
        const tailored = await tailorContent(content, analysis, sectionName);
        updateCustomContent(blockId, tailored);
    } catch (error) {
        console.error("Tailoring failed", error);
    } finally {
        setTailoringBlockId(null);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* LEFT SIDEBAR: Requirements Analysis */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-800">{analysis.clientName}</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">{analysis.projectTitle}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {analysis.summary}
                </p>
            </div>
            
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</h3>
                <ul className="space-y-2">
                    {analysis.keyRequirements?.map((req, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-700">
                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></span>
                            {req}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strategy Insights</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="block text-xs text-slate-400">Complexity</span>
                        <span className="text-sm font-medium text-slate-700">{analysis.suggestedStrategy?.complexity || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="block text-xs text-slate-400">Speed</span>
                        <span className="text-sm font-medium text-slate-700">{analysis.suggestedStrategy?.speed || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 col-span-2">
                        <span className="block text-xs text-slate-400">Tone</span>
                        <span className="text-sm font-medium text-slate-700">{analysis.suggestedStrategy?.tone || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT MAIN: Proposal Builder */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-800">Proposal Builder</h1>
            <div className="flex space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    Save Draft
                </button>
                <button 
                    onClick={() => onPreview(proposalState)}
                    className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Next: Refine Proposal
                </button>
            </div>
        </div>

        {/* Builder Canvas */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {sections.map((section) => {
                const isCaseStudy = section.key === 'case_studies';
                const isPricing = section.key === 'pricing';
                
                const camelCaseKey = section.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                
                const stateKey = isCaseStudy 
                    ? 'caseStudiesBlockIds' 
                    : isPricing 
                        ? 'pricingItems' 
                        : `${camelCaseKey}BlockId`;
                
                // @ts-ignore
                const currentBlockId = proposalState[stateKey];
                
                // Look in both standard blocks and library blocks
                const currentBlock = (!isCaseStudy && !isPricing)
                    ? (BUILDING_BLOCKS.find(b => b.id === currentBlockId) || libraryBlocks.find(b => b.id === currentBlockId))
                    : null;
                
                const recommendation = getRecommendation(section.key);
                const isActive = proposalState.activeSections[section.key];
                
                // Merge standard blocks with user library blocks
                const categoryLibraryBlocks = libraryBlocks.filter(b => b.category === section.key);
                // Convert LibraryBlock to BuildingBlock structure (compatible)
                const adaptedLibraryBlocks: BuildingBlock[] = categoryLibraryBlocks.map(b => ({
                    ...b,
                    tags: [...b.tags, 'custom']
                }));
                
                const options = [...BUILDING_BLOCKS.filter(b => b.category === section.key), ...adaptedLibraryBlocks];

                return (
                    <div key={section.key} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${activeSection === section.key && isActive ? 'ring-2 ring-primary-100 border-primary-300' : 'border-slate-200 hover:border-slate-300'} ${!isActive ? 'opacity-60' : ''}`}>
                        {/* Card Header */}
                        <div 
                            className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-slate-100"
                            onClick={() => isActive && setActiveSection(activeSection === section.key ? null : section.key)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${!isActive ? 'bg-slate-100 text-slate-400' : (activeSection === section.key ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500')}`}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className={`font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{section.label}</h3>
                                        {!isActive && <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">Skipped</span>}
                                    </div>
                                    {isActive && (
                                        <p className="text-sm text-slate-500 truncate w-96">
                                            {isCaseStudy ? (
                                                <span>Selected: <span className="font-medium text-slate-700">{proposalState.caseStudiesBlockIds.length} examples</span></span>
                                            ) : isPricing ? (
                                                <span>Total Investment: <span className="font-medium text-slate-700">${calculateTotals().baseTotal.toLocaleString()}</span></span>
                                            ) : (
                                                <span>Using: <span className="font-medium text-slate-700">{currentBlock?.name}</span></span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={(e) => toggleSection(section.key, e)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isActive ? 'bg-primary-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                
                                {isActive && (
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeSection === section.key ? 'rotate-180' : ''}`} />
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                        {activeSection === section.key && isActive && (
                            <div className="p-6 bg-slate-50/50">
                                {isPricing ? (
                                    // ---------------- PRICING BUILDER UI ----------------
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-medium text-slate-700">Line Items</h4>
                                            {recommendation.reasoning && (
                                                <div className="flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                                    <Wand2 className="w-3 h-3 mr-1" />
                                                    AI Recommended: {recommendation.blockId === 'price-fix' ? 'Fixed Price' : 'Time & Materials'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-5/12">Item Description</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Unit</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/12">Qty</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Unit Cost</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Total</th>
                                                        <th className="px-4 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {proposalState.pricingItems.map((item) => (
                                                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={item.description}
                                                                    onChange={(e) => updatePricingItem(item.id, 'description', e.target.value)}
                                                                    className="w-full text-sm border-0 bg-transparent focus:ring-0 placeholder-slate-300 font-medium text-slate-800"
                                                                    placeholder="Enter item description..."
                                                                />
                                                                <div className="flex items-center mt-1">
                                                                    <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={item.isOptional}
                                                                            onChange={(e) => updatePricingItem(item.id, 'isOptional', e.target.checked)}
                                                                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-3 h-3" 
                                                                        />
                                                                        <span>Mark as Optional</span>
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <select 
                                                                    value={item.unit}
                                                                    onChange={(e) => updatePricingItem(item.id, 'unit', e.target.value)}
                                                                    className="w-full text-xs border-0 bg-transparent focus:ring-0 text-slate-600"
                                                                >
                                                                    <option value="Hour">Hour</option>
                                                                    <option value="Day">Day</option>
                                                                    <option value="Month">Month</option>
                                                                    <option value="Fixed">Fixed Fee</option>
                                                                    <option value="Lot">Lot</option>
                                                                    <option value="License">License</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <input 
                                                                    type="number" 
                                                                    value={item.quantity}
                                                                    onChange={(e) => updatePricingItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                                    className="w-full text-sm text-right border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <div className="relative">
                                                                    <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                                                                    <input 
                                                                        type="number" 
                                                                        value={item.unitCost}
                                                                        onChange={(e) => updatePricingItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                                                        className="w-full text-sm text-right border border-slate-200 rounded pl-5 pr-2 py-1 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <span className={`text-sm font-semibold ${item.isOptional ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                                                    ${(item.quantity * item.unitCost).toLocaleString()}
                                                                </span>
                                                                {item.isOptional && <span className="block text-[10px] text-slate-400 uppercase">(Optional)</span>}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                <button 
                                                                    onClick={() => removePricingItem(item.id)}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button 
                                                onClick={addPricingItem}
                                                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-medium border-t border-slate-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-3 h-3" /> Add Line Item
                                            </button>
                                        </div>

                                        <div className="flex justify-end mt-4 space-x-8">
                                            <div className="text-right">
                                                <span className="block text-xs text-slate-500 uppercase tracking-wide">Total Investment</span>
                                                <span className="text-2xl font-bold text-slate-800">${calculateTotals().baseTotal.toLocaleString()}</span>
                                            </div>
                                            <div className="text-right pl-8 border-l border-slate-200">
                                                <span className="block text-xs text-slate-400 uppercase tracking-wide">Total (w/ Optionals)</span>
                                                <span className="text-xl font-medium text-slate-500">${calculateTotals().withOptionals.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // ---------------- STANDARD BLOCK BUILDER UI ----------------
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                {isCaseStudy ? 'Select Relevant Case Studies (Multi-select)' : 'Select Option'}
                                            </label>
                                            
                                            {isCaseStudy ? (
                                                <div className="flex flex-col space-y-2 max-h-[400px] overflow-y-auto pr-2 mb-6">
                                                    {options.map(opt => {
                                                        const isRecommended = recommendation.blockId === opt.id;
                                                        const isSelected = proposalState.caseStudiesBlockIds.includes(opt.id);

                                                        return (
                                                            <div 
                                                                key={opt.id}
                                                                onClick={() => toggleCaseStudy(opt.id)}
                                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all group
                                                                    ${isSelected 
                                                                        ? 'bg-white border-primary-500 shadow-sm' 
                                                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className={`flex-shrink-0 mr-4 ${isSelected ? 'text-primary-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-0.5">
                                                                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                            {opt.name}
                                                                        </span>
                                                                        {isRecommended && (
                                                                            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center border border-amber-200">
                                                                                <Wand2 className="w-3 h-3 mr-1" /> Best Fit
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 truncate pr-4">{opt.description}</p>
                                                                </div>
                                                                <div className="hidden sm:flex flex-wrap gap-1 ml-4 justify-end max-w-[30%]">
                                                                     {opt.tags.slice(0, 2).map(t => (
                                                                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-wide whitespace-nowrap">
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {options.map(opt => {
                                                        const isRecommended = recommendation.blockId === opt.id;
                                                        // @ts-ignore
                                                        const isSelected = currentBlockId === opt.id;
                                                        
                                                        return (
                                                            <div 
                                                                key={opt.id}
                                                                onClick={() => updateBlock(stateKey, opt.id)}
                                                                className={`cursor-pointer relative p-4 rounded-lg border-2 transition-all
                                                                    ${isSelected 
                                                                        ? 'border-primary-500 bg-white shadow-md' 
                                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                {isRecommended && (
                                                                    <div className="absolute -top-3 -right-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center border border-amber-200 shadow-sm z-10">
                                                                        <Wand2 className="w-3 h-3 mr-1" /> AI Pick
                                                                    </div>
                                                                )}
                                                                {opt.tags.includes('custom') && (
                                                                    <div className="absolute -top-3 -right-2 bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center border border-primary-200 shadow-sm z-10">
                                                                        <Library className="w-3 h-3 mr-1" /> Custom
                                                                    </div>
                                                                )}
                                                                <div className="font-medium text-slate-800 text-sm mb-1">{opt.name}</div>
                                                                <div className="text-xs text-slate-500 line-clamp-2 mb-2">{opt.description}</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {opt.tags.map(t => (
                                                                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-wide">
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {recommendation.reasoning && (
                                                <div className="mt-4 flex items-start space-x-2 bg-amber-50 p-3 rounded-lg text-sm text-amber-800 border border-amber-100">
                                                    <Wand2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span><strong>AI Suggestion:</strong> {recommendation.reasoning}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Rich Content Editor for selected block(s) */}
                                        {isCaseStudy ? (
                                            <div className="space-y-6">
                                                <h4 className="text-sm font-medium text-slate-700">Customize Selected Case Studies</h4>
                                                {proposalState.caseStudiesBlockIds.map(id => {
                                                    const block = options.find(o => o.id === id);
                                                    if (!block) return null;
                                                    const editedContent = proposalState.customContent[id] || block.content;
                                                    
                                                    return (
                                                        <MarkdownEditor 
                                                            key={id}
                                                            label={`Editing: ${block.name}`}
                                                            value={editedContent}
                                                            onChange={(newVal) => updateCustomContent(id, newVal)}
                                                            // Tailoring moved to Refine stage
                                                            // onTailor={() => handleTailor(id, editedContent, block.name)}
                                                            // isTailoring={tailoringBlockId === id}
                                                        />
                                                    );
                                                })}
                                                {proposalState.caseStudiesBlockIds.length === 0 && (
                                                    <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                                                        No case studies selected. Select options above to edit content.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            currentBlock && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-slate-700">Customize Content</h4>
                                                    <MarkdownEditor 
                                                        value={proposalState.customContent[currentBlock.id] || currentBlock.content}
                                                        onChange={(newVal) => updateCustomContent(currentBlock.id, newVal)}
                                                        // Tailoring moved to Refine stage
                                                        // onTailor={() => handleTailor(currentBlock.id, proposalState.customContent[currentBlock.id] || currentBlock.content, currentBlock.name)}
                                                        // isTailoring={tailoringBlockId === currentBlock.id}
                                                    />
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
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
