import React from 'react';
import { Mail, Undo2, Redo2, Save, Eye, Send, Download, Copy, Palette } from 'lucide-react';

function Header({ onSave, onPreview, onSendTest, onExport, onCopy, onUndo, onRedo, onSettings }) {
  return (
    <header className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg text-white">
            <Mail size={18} strokeWidth={2} />
          </div>
          <h1 className="text-base font-semibold text-gray-800 tracking-tight">Newsletter Builder</h1>
        </div>

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 pl-6 border-l border-gray-200">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-md text-gray-500 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700" title="Undo" onClick={onUndo}>
            <Undo2 size={16} />
            <span>Undo</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 rounded-md text-gray-500 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700" title="Redo" onClick={onRedo}>
            <Redo2 size={16} />
            <span>Redo</span>
          </button>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={onSettings}>
          <Palette size={16} />
          <span>Global Style</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={onSave}>
          <Save size={16} />
          <span>Save</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={onPreview}>
          <Eye size={16} />
          <span>Preview</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={onSendTest}>
          <Send size={16} />
          <span>Send Test</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={onCopy}>
          <Copy size={16} />
          <span>Copy HTML</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 border border-blue-500 rounded-md text-white text-[13px] font-medium cursor-pointer transition-all hover:bg-blue-600 hover:border-blue-600 shadow-sm shadow-blue-500/20" onClick={onExport}>
          <Download size={16} />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
