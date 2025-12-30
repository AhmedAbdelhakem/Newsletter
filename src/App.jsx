import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
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
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' or 'settings'
  const [status, setStatus] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);

  // Load draft from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('newsletterDraft');
    const savedSettings = localStorage.getItem('newsletterSettings');
    if (savedData) {
      setEditorData(JSON.parse(savedData));
    }
    if (savedSettings) {
      setPageSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleEditorChange = useCallback((data) => {
    setEditorData(data);
    localStorage.setItem('newsletterDraft', JSON.stringify(data));
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setPageSettings(newSettings);
    localStorage.setItem('newsletterSettings', JSON.stringify(newSettings));
  }, []);

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

  const handleCopy = useCallback(() => {
    const html = renderEmailHTML(editorData, pageSettings);
    navigator.clipboard?.writeText(html);
    setStatus('Copied HTML!');
    setTimeout(() => setStatus(''), 3000);
  }, [editorData, pageSettings]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear everything?')) {
      localStorage.removeItem('newsletterDraft');
      localStorage.removeItem('newsletterSettings');
      window.location.reload();
    }
  }, []);

  const previewHtml = renderEmailHTML(editorData, pageSettings);

  return (
    <div className="app-wrapper">
      <Header />

      <main className="app-main">
        {/* Sidebar: Block Palette or Settings */}
        <aside className="palette-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'blocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocks')}
            >
              Blocks
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Global Style
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'blocks' ? (
              <>
                <div className="section-header">
                  <span className="hint">Drag to editor</span>
                </div>
                <BlockPalette />
              </>
            ) : (
              <PageSettings settings={pageSettings} onChange={handleSettingsChange} />
            )}
          </div>
        </aside>

        {/* Editor Section */}
        <section className="editor-section">
          <div className="section-header">
            <h2>Editor</h2>
            <span className="hint">Drop blocks here</span>
          </div>
          <div className="editor-container card">
            <Editor onChange={handleEditorChange} />
          </div>
          <Toolbar
            onExport={handleExport}
            onCopy={handleCopy}
            onClear={handleClear}
            status={status}
          />
        </section>

        {/* Preview Section - takes remaining space */}
        <aside className="preview-section">
          <div className="section-header">
            <h2>Preview</h2>
            <button
              className="send-test-btn"
              onClick={() => setShowSendModal(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Send Test
            </button>
          </div>
          <div className="preview-container card">
            <Preview html={previewHtml} />
          </div>
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
          background: var(--bg-primary);
        }
        
        .app-main {
          flex: 1;
          display: grid;
          grid-template-columns: 180px 1fr 1fr;
          gap: 20px;
          padding: 20px;
          max-width: 100%;
          width: 100%;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .section-header h2 {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .section-header .hint {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        
        .tabs-header {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .tab-btn {
            background: none;
            border: none;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 500;
            color: #6b7280;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .tab-btn:hover {
            background: #f3f4f6;
            color: #1f2937;
        }
        .tab-btn.active {
            background: #eef2ff;
            color: #4f46e5;
            font-weight: 600;
        }
        .sidebar-content {
            flex: 1;
            overflow-y: auto;
        }
        
        .send-test-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          background: var(--accent-gradient);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .send-test-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .palette-section {
          display: flex;
          flex-direction: column;
        }
        
        .editor-section {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .editor-container {
          flex: 1;
          overflow-y: auto;
          min-height: 500px;
        }
        
        .preview-section {
          display: flex;
          flex-direction: column;
        }
        
        .preview-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #f1f5f9;
        }
        
        @media (max-width: 1200px) {
          .app-main {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 20px;
          }
          
          .palette-section {
            order: -1;
          }
          
          .preview-container {
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
