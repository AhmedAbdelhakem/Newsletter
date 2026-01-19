import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import BlockPalette from './components/BlockPalette';
import PageSettings from './components/PageSettings';
import SendTestModal from './components/SendTestModal';
import { renderEmailHTML } from './utils/emailRenderer';

function App() {
  const [editorData, setEditorData] = useState({ blocks: [] });
  // Default background color is now WHITE as requested
  const [pageSettings, setPageSettings] = useState({
    backgroundColor: '#ffffff',
    contentBackgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundVideo: '',
    contentBackgroundImage: '',
    contentBackgroundVideo: '',
    darkModeSupport: false,
    darkModePageColor: '#1a1a1a',
    darkModeContentColor: '#2d2d2d',
    darkModeTextColor: '#e5e5e5'
  });
  const [status, setStatus] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);

  // Resizable preview panel state
  const [previewWidth, setPreviewWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  // Load draft from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('newsletterDraft');
    const savedSettings = localStorage.getItem('newsletterSettings');
    const savedPreviewWidth = localStorage.getItem('previewWidth');
    if (savedData) {
      setEditorData(JSON.parse(savedData));
    }
    if (savedSettings) {
      setPageSettings(JSON.parse(savedSettings));
    }
    if (savedPreviewWidth) {
      setPreviewWidth(parseInt(savedPreviewWidth, 10));
    }
  }, []);

  // Handle resize
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;

      // Clamp between min and max widths
      const clampedWidth = Math.min(Math.max(newWidth, 200), 600);
      setPreviewWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('previewWidth', previewWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, previewWidth]);

  const handleEditorChange = useCallback((data) => {
    setEditorData(data);
    localStorage.setItem('newsletterDraft', JSON.stringify(data));
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setPageSettings(newSettings);
    localStorage.setItem('newsletterSettings', JSON.stringify(newSettings));
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('newsletterDraft', JSON.stringify(editorData));
    localStorage.setItem('newsletterSettings', JSON.stringify(pageSettings));
    setStatus('Saved!');
    setTimeout(() => setStatus(''), 3000);
  }, [editorData, pageSettings]);

  const handlePreview = useCallback(() => {
    const html = renderEmailHTML(editorData, pageSettings);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  }, [editorData, pageSettings]);

  const handleExport = useCallback(() => {
    const html = renderEmailHTML(editorData, pageSettings);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Exported!');
    setTimeout(() => setStatus(''), 3000);
  }, [editorData, pageSettings]);

  const previewHtml = renderEmailHTML(editorData, pageSettings);
  const hasBlocks = editorData.blocks && editorData.blocks.length > 0;

  return (
    <div className="app-wrapper">
      <Header
        onSave={handleSave}
        onPreview={handlePreview}
        onSendTest={() => setShowSendModal(true)}
        onExport={handleExport}
      />

      <main className="app-main" style={{ gridTemplateColumns: `220px 1fr ${previewWidth}px` }}>
        {/* Left Sidebar: Content Blocks */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Content Blocks</h2>
            <p className="sidebar-subtitle">Drag blocks to the canvas</p>
          </div>
          <div className="sidebar-content">
            <BlockPalette />
          </div>
          <div className="sidebar-footer">
            <p className="tip-text">Tip: Click any block in the canvas to edit it directly</p>
          </div>
        </aside>

        {/* Center: Editor Canvas */}
        <section className="canvas-section">
          <div className="canvas-wrapper">
            <Editor onChange={handleEditorChange} />
          </div>
        </section>

        {/* Resize Handle */}
        <div
          className={`resize-handle ${isResizing ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
          ref={resizeRef}
        >
          <div className="resize-line" />
        </div>

        {/* Right: Preview Panel */}
        <aside className="preview-section">
          <Preview html={previewHtml} hasBlocks={hasBlocks} />
        </aside>
      </main>

      {showSendModal && (
        <SendTestModal
          html={previewHtml}
          onClose={() => setShowSendModal(false)}
        />
      )}

      <style>{`
        .app-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        
        .app-main {
          flex: 1;
          display: grid;
          gap: 0;
          padding: 0;
          position: relative;
        }
        
        /* Sidebar */
        .sidebar {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 20px 16px;
        }
        
        .sidebar-header {
          margin-bottom: 16px;
        }
        
        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .sidebar-subtitle {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
        }
        
        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          margin-top: 16px;
        }
        
        .tip-text {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
        }
        
        /* Canvas Section */
        .canvas-section {
          display: flex;
          flex-direction: column;
          padding: 24px;
          background: #f8fafc;
        }
        
        .canvas-wrapper {
          flex: 1;
          background: #ffffff;
          border: 2px dashed #3b82f6;
          border-radius: 12px;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }
        
        /* Resize Handle */
        .resize-handle {
          position: absolute;
          right: ${previewWidth}px;
          top: 0;
          bottom: 0;
          width: 12px;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.15s ease;
        }
        
        .resize-handle:hover,
        .resize-handle.active {
          background: rgba(59, 130, 246, 0.1);
        }
        
        .resize-line {
          width: 4px;
          height: 40px;
          background: #d1d5db;
          border-radius: 2px;
          transition: all 0.15s ease;
        }
        
        .resize-handle:hover .resize-line,
        .resize-handle.active .resize-line {
          background: #3b82f6;
          height: 60px;
        }
        
        /* Preview Section */
        .preview-section {
          background: #f8fafc;
          border-left: 1px solid #e5e7eb;
        }
        
        @media (max-width: 1200px) {
          .app-main {
            grid-template-columns: 1fr !important;
            padding: 16px;
            gap: 16px;
          }
          
          .sidebar {
            order: -1;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .resize-handle {
            display: none;
          }
          
          .preview-section {
            border-left: none;
            border-top: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
