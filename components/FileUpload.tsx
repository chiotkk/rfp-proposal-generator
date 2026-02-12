import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onProcess: (text: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onProcess }) => {
  const [textInput, setTextInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        // Reset the input value so the same file can be selected again if needed
        e.target.value = '';
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (files.length === 0 && !textInput.trim()) return;

    let fullText = textInput + "\n\n";

    // Read files
    for (const file of files) {
        const text = await file.text();
        fullText += `--- START OF FILE: ${file.name} ---\n${text}\n--- END OF FILE ---\n\n`;
    }

    onProcess(fullText);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800">New Proposal</h2>
        <p className="text-slate-500 mt-2">Upload your RFP documents or paste requirements to get started.</p>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors
        ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mb-4 ${dragActive ? 'text-primary-500' : 'text-slate-400'}`} />
        <p className="text-slate-600 font-medium">Drag & drop RFP files here</p>
        <p className="text-slate-400 text-sm mt-1">Supports .txt, .md, .json</p>
        <input 
            type="file" 
            multiple 
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {files.length > 0 && (
            <div className="mt-6 w-full max-w-md space-y-2 z-10">
                {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-2 truncate">
                            <FileText className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-slate-700 truncate">{f.name}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="relative flex py-6 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OR</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Text Area */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Paste Requirements Text</label>
        <textarea 
            className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm"
            placeholder="Paste the raw text from the RFP here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button 
            onClick={handleSubmit}
            disabled={files.length === 0 && !textInput.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
            Analyze & Build Proposal
        </button>
      </div>
    </div>
  );
};