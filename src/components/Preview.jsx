import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

function Preview({ html, hasBlocks = false, isResizing = false }) {
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
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-800">Preview</div>
        <div className="flex items-center gap-4">
          <div className="text-[13px] text-gray-500 flex items-center gap-2">
            {viewMode === 'desktop' ? 'Desktop' : 'Mobile'} View
            <span className="text-xs text-gray-400">{viewportWidth}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            <button
              className={`flex items-center justify-center w-8 h-7 bg-transparent border-none rounded text-gray-400 cursor-pointer transition-all hover:text-gray-600 ${viewMode === 'desktop' ? 'bg-white text-blue-500 shadow-sm' : ''}`}
              onClick={() => setViewMode('desktop')}
              title="Desktop view"
            >
              <Monitor size={16} />
            </button>
            <button
              className={`flex items-center justify-center w-8 h-7 bg-transparent border-none rounded text-gray-400 cursor-pointer transition-all hover:text-gray-600 ${viewMode === 'mobile' ? 'bg-white text-blue-500 shadow-sm' : ''}`}
              onClick={() => setViewMode('mobile')}
              title="Mobile view"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 flex justify-center items-start overflow-hidden pt-5">
        {!hasBlocks ? (
          <div className="flex items-center justify-center h-full w-full">
            <span className="text-sm text-gray-400">No blocks yet</span>
          </div>
        ) : (
          <div className={`w-full h-[calc(100%-40px)] bg-white shadow-md overflow-hidden transition-all duration-300 rounded-lg ${isResizing ? 'pointer-events-none' : ''}`} style={{ maxWidth: viewportWidth }}>
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>

  );
}

export default Preview;
