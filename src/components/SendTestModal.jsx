import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

function SendTestModal({ html, onClose }) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Newsletter Test');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSend = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject,
          html
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setPreviewUrl(data.previewUrl);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      if (err.message.includes('Failed to fetch')) {
        setError('Email server not running. Start it with: node email-server.mjs');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Mail size={20} />
            <h3>Send Test Email</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {status === 'success' ? (
            <div className="success-message">
              <CheckCircle size={48} />
              <h4>Email Sent!</h4>
              <p>Your test newsletter has been sent to <strong>{email}</strong></p>

              {previewUrl && (
                <div className="preview-box">
                  <p className="preview-hint">Since no real SMTP is configured, view it here:</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-link"
                  >
                    <ExternalLink size={14} />
                    View Email in Browser
                  </a>
                </div>
              )}

              {!previewUrl && (
                <p className="success-hint">Check your real inbox!</p>
              )}
            </div>
          ) : (
            <>
              <p className="modal-description">
                Send a test version of your newsletter.
              </p>

              <div className="form-group">
                <label>Recipient Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div className="form-group">
                <label>Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Newsletter Test"
                />
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="modal-note">
                <strong>Note:</strong> Make sure <code>node email-server.mjs</code> is running. To enable real delivery, configure Gmail credentials in that file.
              </div>
            </>
          )}
        </div>

        {status !== 'success' && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              <Send size={14} />
              {status === 'sending' ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease;
          }
          
          .modal-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 420px;
            animation: slideUp 0.25s ease;
          }
          
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-light);
          }
          
          .modal-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .modal-title svg {
            color: var(--accent-primary);
          }
          
          .modal-title h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .modal-close {
            padding: 6px;
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.15s;
          }
          
          .modal-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
          }
          
          .modal-body {
            padding: 24px;
          }
          
          .modal-description {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 20px;
            line-height: 1.5;
          }
          
          .form-group {
            margin-bottom: 16px;
          }
          
          .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 6px;
          }
          
          .form-group input {
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid var(--border-light);
            border-radius: 8px;
          }
          
          .error-message {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            border-radius: 8px;
            font-size: 13px;
          }
          
          .modal-note {
             padding: 10px;
             background: #f3f4f6;
             border-radius: 8px;
             font-size: 11px;
             color: #4b5563;
             margin-top: 16px;
             border-left: 3px solid #cbd5e1;
          }
          
          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 16px 24px;
            border-top: 1px solid var(--border-light);
            background: var(--bg-tertiary);
            border-radius: 0 0 16px 16px;
          }
          
          .success-message {
            text-align: center;
            padding: 20px;
          }
          
          .success-message svg {
            color: #10b981;
            margin-bottom: 16px;
          }
          
          .success-message h4 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
          }
          
          .success-message p {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 16px;
          }
          
          .preview-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 16px;
            margin-top: 16px;
          }
          
          .preview-hint {
            font-size: 12px;
            color: #0369a1;
            margin-bottom: 12px;
          }
          
          .preview-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: #0284c7;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.15s;
          }
          
          .preview-link:hover {
            background: #0369a1;
            transform: translateY(-1px);
          }
          
          .success-hint {
            color: #166534;
            font-weight: 500;
            font-size: 14px;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default SendTestModal;
