import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Database, Search } from 'lucide-react';
import { BuildingBlock } from '../types';
import { BUILDING_BLOCKS } from '../constants';
import { getClient } from '../services/geminiService';
import { Type } from "@google/genai";

// --- Types ---

type ResponseType = 'boolean' | 'narrative' | 'numeric' | 'attachment';

interface NormalizedRow {
  id: string;
  requirement_id: string;
  clause_text: string;
  response_type?: ResponseType;
  response_cell?: string;
  evidence_cell?: string;
  matched_block_id?: string;
  confidence_score?: number;
  status: 'pending' | 'processing' | 'completed' | 'review_needed';
}

// --- Mock Data for Demo ---
// In a real app, this would be parsed from an uploaded Excel file
const MOCK_CSV_DATA = [
    { req_id: "REQ-001", clause: "Vendor must be ISO 27001 certified." },
    { req_id: "REQ-002", clause: "Describe your data encryption standards for data at rest and in transit." },
    { req_id: "REQ-003", clause: "System must support at least 1,000 concurrent users." },
    { req_id: "REQ-004", clause: "Provide a copy of your Business Continuity Plan." },
    { req_id: "REQ-005", clause: "Vendor must provide 24/7 support." },
];

// --- Helper Functions ---

const determineResponseType = async (clause: string): Promise<{ type: ResponseType, confidence: number }> => {
    const ai = getClient();
    if (!process.env.API_KEY) return { type: 'narrative', confidence: 0.5 };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Classify the following RFP requirement clause into one of these types: 'boolean' (Yes/No), 'narrative' (Text explanation), 'numeric' (Specific number), or 'attachment' (Document request).
            
            Clause: "${clause}"
            
            Return JSON: { "type": "string", "confidence": number (0-1) }`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['boolean', 'narrative', 'numeric', 'attachment'] },
                        confidence: { type: Type.NUMBER }
                    }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text);
        }
        return { type: 'narrative', confidence: 0.5 };
    } catch (e) {
        console.error("Classification failed", e);
        return { type: 'narrative', confidence: 0.5 };
    }
};

const findBestBlock = (clause: string, blocks: BuildingBlock[]): { block: BuildingBlock | null, score: number } => {
    // Mock "Embedding Similarity" for demo purposes
    // In a real app, this would use vector embeddings
    
    const lowerClause = clause.toLowerCase();
    let bestBlock: BuildingBlock | null = null;
    let bestScore = 0;

    blocks.forEach(block => {
        let score = 0;
        const lowerContent = block.content.toLowerCase();
        const lowerName = block.name.toLowerCase();
        const lowerTags = block.tags.join(' ').toLowerCase();

        // Simple keyword matching heuristic for demo
        if (lowerClause.includes('iso') && (lowerContent.includes('iso') || lowerTags.includes('security'))) score += 0.8;
        if (lowerClause.includes('encrypt') && (lowerContent.includes('encrypt') || lowerTags.includes('security'))) score += 0.7;
        if (lowerClause.includes('support') && (lowerContent.includes('support') || lowerTags.includes('sla'))) score += 0.6;
        if (lowerClause.includes('user') && (lowerContent.includes('scale') || lowerTags.includes('architecture'))) score += 0.5;
        if (lowerClause.includes('plan') && (lowerContent.includes('continuity') || lowerTags.includes('security'))) score += 0.6;
        
        // Random noise to simulate varying confidence
        score += Math.random() * 0.1;

        if (score > bestScore) {
            bestScore = score;
            bestBlock = block;
        }
    });

    return { block: bestBlock, score: Math.min(bestScore, 0.99) };
};

const generateResponse = async (row: NormalizedRow, block: BuildingBlock): Promise<{ response: string, evidence: string }> => {
    const ai = getClient();
    if (!process.env.API_KEY) return { response: "AI Generation Disabled", evidence: block.id };

    const prompt = `
    You are an RFP Compliance Assistant. Generate a response for a compliance table cell.
    
    Requirement: "${row.clause_text}"
    Response Type: ${row.response_type}
    Source Material: 
    ---
    ${block.content}
    ---
    
    Rules:
    1. If type is 'boolean', output "Comply" only if source explicitly supports it. Otherwise "Partial" or "No".
    2. If type is 'narrative', summarize the source material to directly answer the requirement (max 30 words).
    3. If type is 'numeric', extract the number. If not found, output "TBD".
    4. If type is 'attachment', output "Refer to Attachment: [Block Name]".
    
    Return JSON: { "response": "string" }
    `;

    try {
        const res = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const json = JSON.parse(res.text || '{}');
        return { 
            response: json.response || "Error generating response", 
            evidence: `Source: ${block.name} (ID: ${block.id})` 
        };
    } catch (e) {
        return { response: "Generation Failed", evidence: block.id };
    }
};


// --- Component ---

export const ComplianceModule: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [rows, setRows] = useState<NormalizedRow[]>([]);
  const [progress, setProgress] = useState(0);

  const handleUseMock = () => {
    setStep('processing');
    const initialRows: NormalizedRow[] = MOCK_CSV_DATA.map((item, idx) => ({
        id: idx.toString(),
        requirement_id: item.req_id,
        clause_text: item.clause,
        status: 'pending'
    }));
    setRows(initialRows);
    processRows(initialRows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // For demo, we just ignore the actual file content and use mock data
      // In a real app, we'd parse XLSX/CSV here
      handleUseMock();
  };

  const processRows = async (initialRows: NormalizedRow[]) => {
    const updatedRows = [...initialRows];
    const total = updatedRows.length;
    
    for (let i = 0; i < total; i++) {
        // 1. Classify
        const classification = await determineResponseType(updatedRows[i].clause_text);
        updatedRows[i].response_type = classification.type;
        
        // 2. Retrieve Block
        const { block, score } = findBestBlock(updatedRows[i].clause_text, BUILDING_BLOCKS);
        updatedRows[i].matched_block_id = block?.id;
        updatedRows[i].confidence_score = (classification.confidence + score) / 2; // Simple average

        // 3. Generate Response
        if (block) {
            const gen = await generateResponse(updatedRows[i], block);
            updatedRows[i].response_cell = gen.response;
            updatedRows[i].evidence_cell = gen.evidence;
        } else {
            updatedRows[i].response_cell = "No matching content found.";
            updatedRows[i].evidence_cell = "N/A";
            updatedRows[i].confidence_score = 0.1;
        }

        // 4. Set Status
        updatedRows[i].status = (updatedRows[i].confidence_score || 0) > 0.6 ? 'completed' : 'review_needed';
        
        // Update State incrementally for visual effect
        setRows([...updatedRows]);
        setProgress(Math.round(((i + 1) / total) * 100));
    }
    
    setTimeout(() => setStep('review'), 500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-semibold text-slate-800">Compliance Auto-Fill</h2>
                <p className="text-xs text-slate-500">Upload a compliance matrix to automatically map responses.</p>
            </div>
            {step === 'review' && (
                <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 shadow-sm">
                    Export Results
                </button>
            )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-6">
            {step === 'upload' && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <FileSpreadsheet className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Upload Compliance Matrix</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md text-center">
                        Upload your Excel (.xlsx) or CSV file containing requirements. We'll automatically map them to your content library.
                    </p>
                    
                    <div className="flex flex-col items-center space-y-4">
                        <label className="cursor-pointer px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center w-64 justify-center transition-all">
                            <Upload className="w-4 h-4 mr-2" />
                            Select File
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".csv,.xlsx" 
                                onChange={handleFileUpload}
                            />
                        </label>

                        <div className="flex items-center w-64">
                            <div className="h-px bg-slate-300 flex-1"></div>
                            <span className="px-3 text-xs text-slate-400 font-medium uppercase">Or</span>
                            <div className="h-px bg-slate-300 flex-1"></div>
                        </div>

                        <button 
                            onClick={handleUseMock}
                            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm flex items-center w-64 justify-center transition-all"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Use Example Matrix
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-6">Supported formats: CSV, XLSX</p>
                </div>
            )}

            {step === 'processing' && (
                <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Processing Requirements</h3>
                    <p className="text-sm text-slate-500 mb-6">Analyzing {rows.length} rows against knowledge base...</p>
                    
                    <div className="w-full max-w-md bg-slate-200 rounded-full h-2 mb-2">
                        <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500">{progress}% Complete</p>
                    
                    {/* Live Log */}
                    <div className="mt-8 w-full max-w-2xl bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-h-60 overflow-y-auto">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Live Processing Log</h4>
                        <div className="space-y-2">
                            {rows.map((row, i) => (
                                <div key={i} className="flex items-center text-xs">
                                    {row.status === 'pending' && <div className="w-2 h-2 bg-slate-300 rounded-full mr-2"></div>}
                                    {row.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-2" />}
                                    {row.status === 'review_needed' && <AlertTriangle className="w-3 h-3 text-amber-500 mr-2" />}
                                    <span className={`truncate ${row.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>
                                        {row.requirement_id}: {row.clause_text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 'review' && (
                <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Requirement</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Generated Response</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">Source / Evidence</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {rows.map((row) => (
                                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.status === 'review_needed' ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-4 py-3 text-xs font-medium text-slate-900 align-top">{row.requirement_id}</td>
                                        <td className="px-4 py-3 text-xs text-slate-600 align-top">{row.clause_text}</td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 capitalize">
                                                {row.response_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-800 align-top font-medium">
                                            {row.response_cell}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 align-top">
                                            <div className="flex items-start space-x-1">
                                                <Database className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                                                <span>{row.evidence_cell}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full w-12">
                                                    <div 
                                                        className={`h-1.5 rounded-full ${
                                                            (row.confidence_score || 0) > 0.7 ? 'bg-emerald-500' : 
                                                            (row.confidence_score || 0) > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`} 
                                                        style={{ width: `${(row.confidence_score || 0) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] text-slate-500">{Math.round((row.confidence_score || 0) * 100)}%</span>
                                            </div>
                                            {row.status === 'review_needed' && (
                                                <span className="text-[10px] text-amber-600 font-medium mt-1 block">Needs Review</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
