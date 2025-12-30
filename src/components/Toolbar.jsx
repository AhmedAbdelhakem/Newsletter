import React from 'react';
import { Download, RotateCcw, Check } from 'lucide-react';

function Toolbar({ onExport, onCopy, onClear, status }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="btn btn-primary" onClick={onExport}>
          <Download size={16} />
          Export HTML
        </button>

        <button className="btn btn-secondary" onClick={onCopy}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy HTML
        </button>

        <button className="btn btn-secondary" onClick={onClear}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {status && (
        <div className="toolbar-status animate-fadeIn">
          <Check size={14} />
          {status}
        </div>
      )}

      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          margin-top: 20px;
          border-top: 1px solid var(--border-light);
        }
        
        .toolbar-left {
          display: flex;
          gap: 10px;
        }
        
        .toolbar-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: var(--radius-md);
          color: #059669;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default Toolbar;
