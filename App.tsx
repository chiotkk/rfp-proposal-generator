import React, { useState } from 'react';
import { AppStep, RFPAnalysis, Recommendations, ProposalState } from './types';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ProposalBuilder } from './components/ProposalBuilder';
import { ProposalPreview } from './components/ProposalPreview';
import { SettingsModal } from './components/SettingsModal';
import { analyzeRFP, recommendBlocks } from './services/geminiService';
import { Settings, Wand2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [rfpText, setRfpText] = useState<string>('');
  const [analysis, setAnalysis] = useState<RFPAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [finalState, setFinalState] = useState<ProposalState | null>(null);
  const [progress, setProgress] = useState(0);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

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
    setStep(AppStep.PREVIEW);
  };

  const handleBackToEditor = () => {
    setStep(AppStep.BUILDER);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-50">
            <div className="flex items-center space-x-2">
                <div className="bg-primary-600 p-1.5 rounded-lg">
                    <Wand2 className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-800 tracking-tight">ProposalPro AI</span>
            </div>
            
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
                <div className={`flex items-center space-x-2 text-sm font-medium ${step === AppStep.PREVIEW ? 'text-primary-600' : 'text-slate-400'}`}>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current text-xs">3</span>
                    <span>Export</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                 >
                    <Settings className="w-5 h-5" />
                 </button>
                 <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-semibold text-xs border border-slate-300">
                    JS
                 </div>
            </div>
        </header>

        {/* Main Content Area */}
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
                />
            )}
            
            {step === AppStep.PREVIEW && finalState && analysis && (
                <ProposalPreview 
                    state={finalState} 
                    analysis={analysis} 
                    onBack={handleBackToEditor}
                    logo={logo}
                />
            )}
        </main>

        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentLogo={logo}
            onSaveLogo={setLogo}
        />
    </div>
  );
}