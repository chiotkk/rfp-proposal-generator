import React, { useRef, useState } from 'react';
import { 
    Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
    Heading1, Heading2, Eye, EyeOff, Undo, Redo, Wand2
} from 'lucide-react';
import Markdown from 'react-markdown';

interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    label?: string;
    onTailor?: () => Promise<void>;
    isTailoring?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, label, onTailor, isTailoring }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Helper to insert text at cursor position
    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const previousText = textarea.value;
        const selectedText = previousText.substring(start, end);

        const newText = 
            previousText.substring(0, start) +
            before + selectedText + after +
            previousText.substring(end);

        onChange(newText);

        // Reset cursor focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Markdown image syntax
                insertText(`\n![${file.name}](${base64})\n`);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toolbarBtnClass = "p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors";

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mt-4">
            {/* Header / Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-1">
                    {label && <span className="text-xs font-bold text-slate-400 uppercase mr-3">{label}</span>}
                    
                    {onTailor && (
                        <button 
                            onClick={onTailor}
                            disabled={isTailoring}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border transition-all mr-2
                                ${isTailoring 
                                    ? 'bg-primary-50 text-primary-400 border-primary-100 cursor-wait' 
                                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                        >
                            <Wand2 className={`w-3 h-3 ${isTailoring ? 'animate-spin' : ''}`} />
                            <span>{isTailoring ? 'Tailoring...' : 'Tailor to RFP'}</span>
                        </button>
                    )}

                    <button onClick={() => insertText('**', '**')} className={toolbarBtnClass} title="Bold">
                        <Bold className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertText('*', '*')} className={toolbarBtnClass} title="Italic">
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button onClick={() => insertText('## ')} className={toolbarBtnClass} title="Heading">
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertText('- ')} className={toolbarBtnClass} title="Bullet List">
                        <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertText('1. ')} className={toolbarBtnClass} title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button onClick={() => insertText('[', '](url)')} className={toolbarBtnClass} title="Link">
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className={toolbarBtnClass} title="Insert Image">
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <button 
                    onClick={() => setShowPreview(!showPreview)} 
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${showPreview ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                    {showPreview ? <><EyeOff className="w-3 h-3" /> <span>Edit</span></> : <><Eye className="w-3 h-3" /> <span>Preview</span></>}
                </button>
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[200px] bg-white">
                {showPreview ? (
                    <div className="prose prose-sm max-w-none p-4 text-slate-700 bg-slate-50 min-h-[200px]">
                        {value ? (
                            <Markdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    img: ({node, ...props}) => <img className="max-w-full rounded-lg my-2 border border-slate-200" {...props} />,
                                }}
                            >
                                {value}
                            </Markdown>
                        ) : (
                            <span className="text-slate-400 italic">No content...</span>
                        )}
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full min-h-[200px] p-4 outline-none resize-y text-sm font-mono text-slate-700 leading-relaxed"
                        placeholder="Type your content here... Use Markdown for formatting."
                    />
                )}
            </div>
            
            <div className="bg-slate-50 px-3 py-1 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                <span>Markdown Supported</span>
                <span>{value.length} chars</span>
            </div>
        </div>
    );
};
