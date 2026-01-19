import React from 'react';
import { Mail, Undo2, Redo2, Save, Eye, Send, Download } from 'lucide-react';

function Header({ onSave, onPreview, onSendTest, onExport }) {
  return (
    <header className="app-header">
      <div className="header-content">
        {/* Left: Logo and Title */}
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">
              <Mail size={18} strokeWidth={2} />
            </div>
            <h1 className="logo-text">Newsletter Builder</h1>
          </div>

          {/* Undo/Redo Buttons */}
          <div className="undo-redo-group">
            <button className="icon-btn" title="Undo">
              <Undo2 size={16} />
              <span>Undo</span>
            </button>
            <button className="icon-btn" title="Redo">
              <Redo2 size={16} />
              <span>Redo</span>
            </button>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="header-actions">
          <button className="action-btn" onClick={onSave}>
            <Save size={16} />
            <span>Save</span>
          </button>
          <button className="action-btn" onClick={onPreview}>
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button className="action-btn" onClick={onSendTest}>
            <Send size={16} />
            <span>Send Test</span>
          </button>
          <button className="action-btn primary" onClick={onExport}>
            <Download size={16} />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      <style>{`
        .app-header {
          padding: 12px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #3b82f6;
          border-radius: 8px;
          color: white;
        }
        
        .logo-text {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          letter-spacing: -0.01em;
        }
        
        .undo-redo-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-left: 24px;
          border-left: 1px solid #e5e7eb;
        }
        
        .icon-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .icon-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .action-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        
        .action-btn.primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .action-btn.primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
      `}</style>
    </header>
  );
}

export default Header;
