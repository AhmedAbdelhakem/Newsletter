import React, { useRef, useEffect } from 'react';

function Preview({ html }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  return (
    <div className="preview-wrapper">
      <iframe
        ref={iframeRef}
        title="Email Preview"
        className="preview-frame"
      />

      <style>{`
        .preview-wrapper {
          height: 100%;
          padding: 16px;
        }
        
        .preview-frame {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: var(--radius-md);
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

export default Preview;
