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
      const response = await fetch('/api/send-test', {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-1000 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Mail size={20} className="text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">Send Test Email</h3>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-5">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Email Sent!</h4>
              <p className="text-sm text-gray-500 mb-4">Your test newsletter has been sent to <strong>{email}</strong></p>

              {previewUrl && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mt-4">
                  <p className="text-xs text-sky-700 mb-3">Since no real SMTP is configured, view it here:</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 text-white no-underline rounded-md text-sm font-medium transition-transform hover:bg-sky-700 hover:-translate-y-px"
                  >
                    <ExternalLink size={14} />
                    View Email in Browser
                  </a>
                </div>
              )}

              {!previewUrl && (
                <p className="text-emerald-700 font-medium text-sm">Check your real inbox!</p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Send a test version of your newsletter.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Recipient Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Newsletter Test"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[13px]">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 border-l-[3px] border-gray-300">
                  <strong>Note:</strong> Make sure <code>node email-server.mjs</code> is running. To enable real delivery, configure Gmail credentials in that file.
                </div>
              </div>
            </>
          )}
        </div>

        {status !== 'success' && (
          <div className="flex justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-[13px] font-medium cursor-pointer transition-colors hover:bg-gray-50 hover:border-gray-300" onClick={onClose}>
              Cancel
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 border border-blue-500 rounded-md text-white text-[13px] font-medium cursor-pointer transition-colors hover:bg-blue-600 hover:border-blue-600 shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              <Send size={14} />
              {status === 'sending' ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <button className="px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SendTestModal;
