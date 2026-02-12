
export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  BUILDER = 'BUILDER',
  PREVIEW = 'PREVIEW',
}

export type BlockCategory = 
  | 'intro' 
  | 'timeline' 
  | 'scope' 
  | 'pricing' 
  | 'terms' 
  | 'deliverables'
  | 'team' 
  | 'case_studies' 
  | 'qa' 
  | 'security' 
  | 'change_mgmt' 
  | 'training';

export interface BuildingBlock {
  id: string;
  name: string;
  description: string;
  content: string; // Markdown or text content
  category: BlockCategory;
  tags: string[]; // e.g., "aggressive", "mvp", "enterprise"
}

export interface RFPAnalysis {
  clientName: string;
  projectTitle: string;
  summary: string;
  keyRequirements: string[];
  suggestedStrategy: {
    complexity: 'Low' | 'Medium' | 'High';
    speed: 'Fast' | 'Standard' | 'Relaxed';
    tone: 'Professional' | 'Innovative' | 'Formal';
  };
}

export interface PricingLineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitCost: number;
  isOptional: boolean;
}

export interface ProposalState {
  introBlockId: string;
  timelineBlockId: string;
  scopeBlockId: string;
  pricingItems: PricingLineItem[]; 
  termsBlockId: string;
  deliverablesBlockId: string;
  teamBlockId: string;
  caseStudiesBlockIds: string[]; 
  qaBlockId: string;
  securityBlockId: string;
  changeMgmtBlockId: string;
  trainingBlockId: string;
  
  // Track which sections are enabled/included
  activeSections: Record<string, boolean>;

  // Store user edits for specific blocks: blockId -> editedContent
  customContent: Record<string, string>;
}

export interface AIRecommendation {
  blockId: string;
  reasoning: string;
}

export interface Recommendations {
  intro: AIRecommendation;
  timeline: AIRecommendation;
  scope: AIRecommendation;
  pricing: AIRecommendation;
  terms: AIRecommendation;
  deliverables: AIRecommendation;
  team: AIRecommendation;
  case_studies: AIRecommendation;
  qa: AIRecommendation;
  security: AIRecommendation;
  change_mgmt: AIRecommendation;
  training: AIRecommendation;
}
