import { GoogleGenAI, Type } from "@google/genai";
import { RFPAnalysis, Recommendations, BuildingBlock } from '../types';
import { BUILDING_BLOCKS } from '../constants';

export const getClient = () => {
    // We assume the API key is available in the environment variables
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
        console.error("API_KEY is missing from environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

// Robust JSON cleaner that handles Markdown and common LLM syntax errors
const cleanAndParseJson = <T>(text: string): T => {
    // 1. Remove Markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Try parsing straight away
    try {
        return JSON.parse(cleaned) as T;
    } catch (e) {
        // console.warn("First parse attempt failed, attempting repair...");
    }

    // 3. Common Error: Unescaped newlines inside strings.
    // Strategy: Flatten the JSON to a single line. 
    // Valid JSON ignores whitespace between tokens.
    // If a newline is inside a string, it's invalid JSON. Replacing it with a space fixes validity (though alters content slightly).
    const oneLiner = cleaned.replace(/[\r\n]+/g, ' ');
    
    try {
        return JSON.parse(oneLiner) as T;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        throw e;
    }
};

const DEFAULT_RECOMMENDATIONS: Recommendations = {
    intro: { blockId: 'intro-std', reasoning: 'Defaulting to standard configuration.' },
    timeline: { blockId: 'time-std', reasoning: 'Defaulting to standard configuration.' },
    scope: { blockId: 'scope-std', reasoning: 'Defaulting to standard configuration.' },
    pricing: { blockId: 'price-tm', reasoning: 'Defaulting to standard configuration.' },
    terms: { blockId: 'terms-std', reasoning: 'Defaulting to standard configuration.' },
    deliverables: { blockId: 'del-std', reasoning: 'Defaulting to standard configuration.' },
    team: { blockId: 'team-std', reasoning: 'Defaulting to standard configuration.' },
    case_studies: { blockId: 'case-fintech', reasoning: 'Defaulting to standard configuration.' },
    qa: { blockId: 'qa-std', reasoning: 'Defaulting to standard configuration.' },
    security: { blockId: 'sec-std', reasoning: 'Defaulting to standard configuration.' },
    change_mgmt: { blockId: 'cm-agile', reasoning: 'Defaulting to standard configuration.' },
    training: { blockId: 'train-tt', reasoning: 'Defaulting to standard configuration.' },
};

export const analyzeRFP = async (rfpText: string): Promise<RFPAnalysis> => {
    const ai = getClient();
    
    // Safety fallback if no key
    if (!process.env.API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve({
            clientName: "Unknown Client (Missing API Key)",
            projectTitle: "Project Analysis Failed",
            summary: "Please provide a valid Gemini API Key to analyze the document.",
            keyRequirements: ["Check API Key configuration"],
            suggestedStrategy: { complexity: 'Medium', speed: 'Standard', tone: 'Professional' }
        }), 1000));
    }

    try {
        // Sanitize Input: Collapse excessive newlines which might confuse the model or cause it to echo garbage
        const sanitizedRfp = rfpText
            .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '') // Remove non-printable control chars
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .substring(0, 30000);

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are an expert Proposal Manager. Analyze the following RFP text and extract the key details.
            
            RFP TEXT:
            ${sanitizedRfp}
            
            Return a JSON object with this exact structure. 
            Ensure "summary" is concise (max 300 chars) and does not contain unescaped newlines.
            
            {
                "clientName": "Name of the company issuing the RFP",
                "projectTitle": "A short title for the project",
                "summary": "A 2-sentence summary of what they want",
                "keyRequirements": ["Req 1", "Req 2", "Req 3", "Req 4", "Req 5"],
                "suggestedStrategy": {
                    "complexity": "Low" | "Medium" | "High",
                    "speed": "Fast" | "Standard" | "Relaxed",
                    "tone": "Professional" | "Innovative" | "Formal"
                }
            }`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        projectTitle: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        keyRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedStrategy: {
                            type: Type.OBJECT,
                            properties: {
                                complexity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                                speed: { type: Type.STRING, enum: ['Fast', 'Standard', 'Relaxed'] },
                                tone: { type: Type.STRING, enum: ['Professional', 'Innovative', 'Formal'] }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const parsed = cleanAndParseJson<Partial<RFPAnalysis>>(response.text);
            return {
                clientName: parsed.clientName || "Unknown Client",
                projectTitle: parsed.projectTitle || "Untitled Project",
                summary: parsed.summary || "No summary available.",
                keyRequirements: parsed.keyRequirements || [],
                suggestedStrategy: {
                    complexity: parsed.suggestedStrategy?.complexity || 'Medium',
                    speed: parsed.suggestedStrategy?.speed || 'Standard',
                    tone: parsed.suggestedStrategy?.tone || 'Professional'
                }
            };
        }
        throw new Error("No response text from Gemini");
    } catch (error) {
        console.error("Analysis failed", error);
        // Fallback for demo if API fails or parses badly
        return {
            clientName: "Potential Client",
            projectTitle: "New Project Request",
            summary: "We parsed the document but encountered an issue extracting specific details. Please review the manual text.",
            keyRequirements: ["Review RFP manually for specific requirements."],
            suggestedStrategy: { complexity: 'Medium', speed: 'Standard', tone: 'Professional' }
        };
    }
};

export const tailorContent = async (currentContent: string, analysis: RFPAnalysis, sectionName: string): Promise<string> => {
    const ai = getClient();
    
    if (!process.env.API_KEY) {
         return currentContent + "\n\n[AI Tailoring Failed: Missing API Key]";
    }

    try {
        const prompt = `
        You are an expert Proposal Writer. Your task is to rewrite the following proposal section to specifically address the client's RFP requirements.
        
        CONTEXT:
        Client: ${analysis.clientName}
        Project: ${analysis.projectTitle}
        Key Requirements: ${analysis.keyRequirements.join(', ')}
        Strategy Tone: ${analysis.suggestedStrategy.tone}
        
        SECTION TO REWRITE (${sectionName}):
        ${currentContent}
        
        INSTRUCTIONS:
        1. Keep the core message and structure of the original content.
        2. Insert specific references to the client's name and project where appropriate.
        3. Highlight how our solution specifically meets their key requirements.
        4. Adjust the tone to match the strategy (${analysis.suggestedStrategy.tone}).
        5. Return ONLY the rewritten Markdown content. Do not include explanations.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        if (response.text) {
            return response.text.trim();
        }
        throw new Error("No response text for tailoring");
    } catch (error) {
        console.error("Tailoring failed", error);
        return currentContent;
    }
};

export const recommendBlocks = async (analysis: RFPAnalysis): Promise<Recommendations> => {
    const ai = getClient();
    
    if (!process.env.API_KEY) {
         return DEFAULT_RECOMMENDATIONS;
    }

    const blocksSummary = BUILDING_BLOCKS.map(b => ({ id: b.id, name: b.name, desc: b.description, category: b.category }));

    const complexity = analysis.suggestedStrategy?.complexity || 'Medium';
    const speed = analysis.suggestedStrategy?.speed || 'Standard';

    try {
        const prompt = `
        Based on the following RFP analysis, select the most appropriate Building Block ID for each category from the provided list.
        
        RFP ANALYSIS:
        Client: ${analysis.clientName}
        Summary: ${analysis.summary}
        Strategy: Complexity=${complexity}, Speed=${speed}
        
        AVAILABLE BLOCKS:
        ${JSON.stringify(blocksSummary)}
        
        Return JSON with fields: intro, timeline, scope, pricing, terms, deliverables, team, case_studies, qa, security, change_mgmt, training.
        Each field must be an object: { "blockId": "id_string", "reasoning": "short explanation" }.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intro: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        timeline: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        scope: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        pricing: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        terms: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        deliverables: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        team: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        case_studies: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        qa: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        security: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        change_mgmt: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                        training: { type: Type.OBJECT, properties: { blockId: { type: Type.STRING }, reasoning: { type: Type.STRING } } },
                    }
                }
            }
        });

        if (response.text) {
             try {
                const parsed = cleanAndParseJson<any>(response.text);
                // Merge with defaults to ensure any missing keys from AI response are filled
                return { ...DEFAULT_RECOMMENDATIONS, ...parsed };
            } catch (e) {
                console.error("JSON Parse Error (Recommendations):", e);
                throw e;
            }
        }
        throw new Error("No response text for recommendations");
    } catch (error) {
        console.error("Recommendation failed", error);
        return DEFAULT_RECOMMENDATIONS;
    }
};