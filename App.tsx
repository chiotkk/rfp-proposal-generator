import React, { useState } from 'react';
import { AppStep, RFPAnalysis, Recommendations, ProposalState, LibraryBlock } from './types';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ProposalBuilder } from './components/ProposalBuilder';
import { ProposalRefiner } from './components/ProposalRefiner';
import { ProposalPreview } from './components/ProposalPreview';
import { SettingsModal } from './components/SettingsModal';
import { ComplianceModule } from './components/ComplianceModule';
import { analyzeRFP, recommendBlocks } from './services/geminiService';
import { Settings, Wand2, FileCheck } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [activeTab, setActiveTab] = useState<'proposal' | 'compliance'>('proposal');
  
  const [rfpText, setRfpText] = useState<string>('');
  const [analysis, setAnalysis] = useState<RFPAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [finalState, setFinalState] = useState<ProposalState | null>(null);
  const [progress, setProgress] = useState(0);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  
  // Content Library State
  const [libraryBlocks, setLibraryBlocks] = useState<LibraryBlock[]>([
    {
        id: 'cust-intro-1',
        name: 'Standard Company Intro',
        description: 'Our standard 2024 boilerplate introduction.',
        category: 'intro',
        tags: ['standard', 'formal'],
        content: `# About Us\n\nWe are a premier digital transformation agency with over 10 years of experience delivering high-impact solutions for enterprise clients.\n\n## Our Mission\nTo empower businesses through technology.`
    }
  ]);

  const handleAnalysis = async (text: string) => {
    setRfpText(text);
    setStep(AppStep.ANALYZING);
    setProgress(10); // Initial progress

    try {
        // 1. Analyze
        const result = await analyzeRFP(text);
        setProgress(60); // Analysis complete

        // 2. Recommend
        const recs = await recommendBlocks(result);
        setProgress(100); // Recommendations complete

        // Small delay to let user see 100%
        setTimeout(() => {
            setAnalysis(result);
            setRecommendations(recs);
            setStep(AppStep.BUILDER);
        }, 600);
        
    } catch (e) {
        console.error("Workflow failed", e);
        setStep(AppStep.UPLOAD);
        alert("Something went wrong analyzing the document. Please ensure your API Key is set.");
    }
  };

  const handlePreview = (state: ProposalState) => {
    setFinalState(state);
    setStep(AppStep.REFINE);
  };

  const handleRefineComplete = (state: ProposalState) => {
    setFinalState(state);
    setStep(AppStep.PREVIEW);
  };

  const handleBackToBuilder = () => {
    setStep(AppStep.BUILDER);
  };

  const handleBackToRefine = () => {
    setStep(AppStep.REFINE);
  };

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 font-sans">
        {/* Left Sidebar Navigation */}
        <aside className="w-16 bg-slate-900 flex flex-col items-center py-6 space-y-6 z-50">
            <div className="bg-primary-600 p-2 rounded-xl mb-4">
                <Wand2 className="text-white w-6 h-6" />
            </div>
            
            <button 
                onClick={() => setActiveTab('proposal')}
                className={`p-3 rounded-xl transition-all group relative ${activeTab === 'proposal' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Proposal Builder"
            >
                <Wand2 className="w-6 h-6" />
                {activeTab === 'proposal' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full -ml-4"></div>}
            </button>

            <button 
                onClick={() => setActiveTab('compliance')}
                className={`p-3 rounded-xl transition-all group relative ${activeTab === 'compliance' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Compliance Matrix"
            >
                <FileCheck className="w-6 h-6" />
                {activeTab === 'compliance' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full -ml-4"></div>}
            </button>

            <div className="flex-1"></div>

            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Settings"
            >
                <Settings className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-600 mt-2">
                JS
            </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'proposal' ? (
                <>
                    {/* Top Navigation Bar (Proposal Specific) */}
                    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
                        <span className="text-lg font-bold text-slate-800 tracking-tight">ProposalPro AI</span>
                        
                        <div className="flex items-center space-x-8">
                            <div className={`flex items-center space-x-2 text-sm font-medium ${step === AppStep.UPLOAD ? 'text-primary-600' : 'text-slate-400'}`}>
                                <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current text-xs">1</span>
                                <span>Upload</span>
                            </div>
                            <div className="w-8 h-px bg-slate-200"></div>
                            <div className={`flex items-center space-x-2 text-sm font-medium ${step === AppStep.BUILDER ? 'text-primary-600' : 'text-slate-400'}`}>
                                <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current text-xs">2</span>
                                <span>Build</span>
                            </div>
                            <div className="w-8 h-px bg-slate-200"></div>
                            <div className={`flex items-center space-x-2 text-sm font-medium ${step === AppStep.REFINE ? 'text-primary-600' : 'text-slate-400'}`}>
                                <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current text-xs">3</span>
                                <span>Refine</span>
                            </div>
                            <div className="w-8 h-px bg-slate-200"></div>
                            <div className={`flex items-center space-x-2 text-sm font-medium ${step === AppStep.PREVIEW ? 'text-primary-600' : 'text-slate-400'}`}>
                                <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current text-xs">4</span>
                                <span>Export</span>
                            </div>
                        </div>

                        <div className="w-20"></div> {/* Spacer for balance */}
                    </header>

                    <main className="flex-1 overflow-hidden relative">
                        {step === AppStep.UPLOAD && <FileUpload onProcess={handleAnalysis} />}
                        
                        {step === AppStep.ANALYZING && (
                            <Loader 
                                message={progress < 60 ? "Analyzing Requirements..." : "Matching Strategy..."} 
                                progress={progress} 
                            />
                        )}
                        
                        {step === AppStep.BUILDER && analysis && recommendations && (
                            <ProposalBuilder 
                                analysis={analysis} 
                                recommendations={recommendations} 
                                onPreview={handlePreview}
                                libraryBlocks={libraryBlocks}
                            />
                        )}

                        {step === AppStep.REFINE && finalState && analysis && (
                            <ProposalRefiner 
                                state={finalState} 
                                analysis={analysis} 
                                onBack={handleBackToBuilder}
                                onNext={handleRefineComplete}
                            />
                        )}
                        
                        {step === AppStep.PREVIEW && finalState && analysis && (
                            <ProposalPreview 
                                state={finalState} 
                                analysis={analysis} 
                                onBack={handleBackToRefine}
                                logo={logo}
                            />
                        )}
                    </main>
                </>
            ) : (
                <ComplianceModule />
            )}
        </div>

        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentLogo={logo}
            onSaveLogo={setLogo}
            libraryBlocks={libraryBlocks}
            onUpdateLibraryBlocks={setLibraryBlocks}
        />
    </div>
  );
}