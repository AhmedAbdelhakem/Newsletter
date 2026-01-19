import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import BlockPalette from './components/BlockPalette';
import PageSettings from './components/PageSettings';
import SendTestModal from './components/SendTestModal';
import Toast from './components/Toast';
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
    setStatus('Exported HTML!');
  }, [editorData, pageSettings]);

  const handleCopy = useCallback(() => {
    const html = renderEmailHTML(editorData, pageSettings);
    navigator.clipboard.writeText(html).then(() => {
      setStatus('Copied HTML!');
    });
  }, [editorData, pageSettings]);

  const previewHtml = renderEmailHTML(editorData, pageSettings);
  const hasBlocks = editorData.blocks && editorData.blocks.length > 0;

  const editorRef = useRef(null);

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.redo();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onSave={handleSave}
        onPreview={handlePreview}
        onSendTest={() => setShowSendModal(true)}
        onExport={handleExport}
        onCopy={handleCopy}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSettings={() => setShowSettingsModal(true)}
      />

      <main
        className="flex-1 grid gap-0 p-0 relative max-[1200px]:grid-cols-1! max-[1200px]:p-4 max-[1200px]:gap-4"
        style={{ gridTemplateColumns: `220px 1fr ${previewWidth}px` }}
      >
        {/* Left Sidebar: Content Blocks */}
        <aside className="flex flex-col bg-white border-r border-gray-200 py-5 px-4 max-[1200px]:-order-1 max-[1200px]:border-r-0 max-[1200px]:border-b">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Content Blocks</h2>
            <p className="text-xs text-gray-400">Drag blocks to the canvas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <BlockPalette />
          </div>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-[11px] text-gray-400 leading-snug">Tip: Click any block in the canvas to edit it directly</p>
          </div>
        </aside>

        {/* Center: Editor Canvas */}
        <section className="flex flex-col p-6 bg-slate-50">
          <div className="flex-1 bg-white border-2 border-dashed border-blue-500 rounded-xl min-h-[600px] flex flex-col">
            <Editor ref={editorRef} onChange={handleEditorChange} />
          </div>
        </section>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center z-50 transition-colors duration-150 hover:bg-blue-500/10 group max-[1200px]:hidden ${isResizing ? 'bg-blue-500/10' : ''}`}
          style={{ right: previewWidth - 6 }}
          onMouseDown={handleMouseDown}
          ref={resizeRef}
        >
          <div className={`w-1 h-10 bg-gray-300 rounded-sm transition-all duration-150 group-hover:bg-blue-500 group-hover:h-[60px] ${isResizing ? 'bg-blue-500 h-[60px]' : ''}`} />
        </div>

        {/* Right: Preview Panel */}
        <aside className="bg-slate-50 border-l border-gray-200 max-[1200px]:border-l-0 max-[1200px]:border-t">
          <Preview html={previewHtml} hasBlocks={hasBlocks} isResizing={isResizing} />
        </aside>
      </main>

      {showSendModal && (
        <SendTestModal
          html={previewHtml}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-1000 animate-in fade-in duration-200" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-semibold text-gray-800">Global Style</h3>
              <button
                className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                onClick={() => setShowSettingsModal(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2 overflow-y-auto">
              <PageSettings settings={pageSettings} onChange={handleSettingsChange} />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl shrink-0 flex justify-end">
              <button
                className="px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                onClick={() => setShowSettingsModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <Toast message={status} onClose={() => setStatus('')} />
      )}
    </div>

  );
}

export default App;
