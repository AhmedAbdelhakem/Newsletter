import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

function Preview({ html, hasBlocks = false }) {
  const iframeRef = useRef(null);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  const viewportWidth = viewMode === 'desktop' ? '600px' : '375px';

  return (
    <div className="preview-wrapper">
      <div className="preview-header">
        <div className="preview-title">Preview</div>
        <div className="preview-controls">
          <div className="view-label">
            {viewMode === 'desktop' ? 'Desktop' : 'Mobile'} View
            <span className="viewport-size">{viewportWidth}</span>
          </div>
          <div className="device-toggle">
            <button
              className={`toggle-btn ${viewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewMode('desktop')}
              title="Desktop view"
            >
              <Monitor size={16} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewMode('mobile')}
              title="Mobile view"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="preview-body">
        {!hasBlocks ? (
          <div className="empty-state">
            <span className="empty-text">No blocks yet</span>
          </div>
        ) : (
          <div className="iframe-container" style={{ maxWidth: viewportWidth }}>
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="preview-frame"
            />
          </div>
        )}
      </div>

      <style>{`
        .preview-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .preview-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .preview-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .view-label {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .viewport-size {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .device-toggle {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 6px;
          padding: 2px;
        }
        
        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .toggle-btn:hover {
          color: #6b7280;
        }
        
        .toggle-btn.active {
          background: #ffffff;
          color: #3b82f6;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .preview-body {
          flex: 1;
          padding: 20px;
          display: flex;
          justify-content: center;
          overflow-y: auto;
        }
        
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 200px;
        }
        
        .empty-text {
          font-size: 14px;
          color: #9ca3af;
        }
        
        .iframe-container {
          width: 100%;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: max-width 0.2s ease;
        }
        
        .preview-frame {
          width: 100%;
          min-height: 500px;
          border: none;
          display: block;
        }
      `}</style>
    </div>
  );
}

export default Preview;
