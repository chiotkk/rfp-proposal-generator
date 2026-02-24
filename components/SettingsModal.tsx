import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Save, Plus, Trash2, Edit2, FileText } from 'lucide-react';
import { LibraryBlock, BlockCategory } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logo: string | null) => void;
  libraryBlocks: LibraryBlock[];
  onUpdateLibraryBlocks: (blocks: LibraryBlock[]) => void;
}

const CATEGORIES: { value: BlockCategory; label: string }[] = [
    { value: 'intro', label: 'Company Profile' },
    { value: 'team', label: 'Team' },
    { value: 'case_studies', label: 'Case Studies' },
    { value: 'scope', label: 'Scope' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'qa', label: 'Quality Assurance' },
    { value: 'security', label: 'Security' },
    { value: 'change_mgmt', label: 'Change Mgmt' },
    { value: 'training', label: 'Training' },
    { value: 'deliverables', label: 'Deliverables' },
    { value: 'terms', label: 'Terms' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, currentLogo, onSaveLogo, libraryBlocks, onUpdateLibraryBlocks 
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'library'>('general');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library State
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<Partial<LibraryBlock>>({});

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = () => {
    onSaveLogo(logoPreview);
    onClose();
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // --- Library Logic ---
  const handleEditBlock = (block: LibraryBlock) => {
      setCurrentBlock(block);
      setIsEditingBlock(true);
  };

  const handleNewBlock = () => {
      setCurrentBlock({
          id: Math.random().toString(36).substr(2, 9),
          category: 'intro',
          tags: ['custom'],
          content: ''
      });
      setIsEditingBlock(true);
  };

  const handleSaveBlock = () => {
      if (!currentBlock.name || !currentBlock.content) return;
      
      const newBlock = currentBlock as LibraryBlock;
      
      if (libraryBlocks.find(b => b.id === newBlock.id)) {
          // Update existing
          onUpdateLibraryBlocks(libraryBlocks.map(b => b.id === newBlock.id ? newBlock : b));
      } else {
          // Create new
          onUpdateLibraryBlocks([...libraryBlocks, newBlock]);
      }
      setIsEditingBlock(false);
      setCurrentBlock({});
  };

  const handleDeleteBlock = (id: string) => {
      if (confirm('Are you sure you want to delete this block?')) {
          onUpdateLibraryBlocks(libraryBlocks.filter(b => b.id !== id));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">Proposal Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                General & Branding
            </button>
            <button 
                onClick={() => setActiveTab('library')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Content Library
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'general' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo (Letterhead)</label>
                <p className="text-xs text-slate-500 mb-4">This logo will appear at the top of your generated proposals.</p>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors relative">
                  {logoPreview ? (
                    <div className="relative w-full flex flex-col items-center">
                        <img src={logoPreview} alt="Logo Preview" className="h-20 object-contain mb-4" />
                        <button 
                            onClick={handleRemoveLogo}
                            className="text-xs text-red-500 hover:underline font-medium"
                        >
                            Remove Logo
                        </button>
                    </div>
                  ) : (
                    <div className="text-center pointer-events-none">
                        <div className="bg-slate-200 p-3 rounded-full inline-flex mb-3">
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Click to upload logo</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG recommended</p>
                    </div>
                  )}
                  
                  {!logoPreview && (
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                  )}
                </div>
              </div>
          ) : (
              <div className="h-full flex flex-col">
                  {isEditingBlock ? (
                      <div className="space-y-4 animate-in slide-in-from-right duration-200">
                          <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-800">{currentBlock.id ? 'Edit Block' : 'New Block'}</h4>
                              <button onClick={() => setIsEditingBlock(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">Block Name</label>
                                  <input 
                                      type="text" 
                                      value={currentBlock.name || ''}
                                      onChange={e => setCurrentBlock({...currentBlock, name: e.target.value})}
                                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                      placeholder="e.g., Enterprise Security"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                                  <select 
                                      value={currentBlock.category}
                                      onChange={e => setCurrentBlock({...currentBlock, category: e.target.value as BlockCategory})}
                                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                  >
                                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Description (Internal)</label>
                              <input 
                                  type="text" 
                                  value={currentBlock.description || ''}
                                  onChange={e => setCurrentBlock({...currentBlock, description: e.target.value})}
                                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder="Short description for the team..."
                              />
                          </div>
                          <div className="flex-1 flex flex-col min-h-[200px]">
                              <label className="block text-xs font-medium text-slate-700 mb-1">Content (Markdown)</label>
                              <textarea 
                                  value={currentBlock.content || ''}
                                  onChange={e => setCurrentBlock({...currentBlock, content: e.target.value})}
                                  className="flex-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 font-mono"
                                  placeholder="# Heading..."
                              />
                          </div>
                          <div className="flex justify-end pt-2">
                              <button 
                                  onClick={handleSaveBlock}
                                  disabled={!currentBlock.name || !currentBlock.content}
                                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
                              >
                                  Save Block
                              </button>
                          </div>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-slate-600">Manage your team's standard content blocks.</p>
                            <button 
                                onClick={handleNewBlock}
                                className="flex items-center px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-100 border border-primary-200"
                            >
                                <Plus className="w-3 h-3 mr-1.5" /> New Block
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {libraryBlocks.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                                    No custom blocks yet. Create one to get started.
                                </div>
                            ) : (
                                libraryBlocks.map(block => (
                                    <div key={block.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-medium text-slate-800 truncate">{block.name}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[10px] uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 rounded">
                                                        {CATEGORIES.find(c => c.value === block.category)?.label || block.category}
                                                    </span>
                                                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{block.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEditBlock(block)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBlock(block.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                      </>
                  )}
              </div>
          )}
        </div>

        {activeTab === 'general' && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 flex-shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
                Cancel
            </button>
            <button 
                onClick={handleSaveLogo}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-sm"
            >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
            </button>
            </div>
        )}
      </div>
    </div>
  );
};