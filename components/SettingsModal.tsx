import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logo: string | null) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentLogo, onSaveLogo }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = () => {
    onSaveLogo(logoPreview);
    onClose();
  };

  const handleRemove = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Proposal Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo (Letterhead)</label>
            <p className="text-xs text-slate-500 mb-4">This logo will appear at the top of your generated proposals.</p>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors relative">
              {logoPreview ? (
                <div className="relative w-full flex flex-col items-center">
                    <img src={logoPreview} alt="Logo Preview" className="h-20 object-contain mb-4" />
                    <button 
                        onClick={handleRemove}
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
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};