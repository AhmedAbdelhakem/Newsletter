import React from 'react';
import { Mail } from 'lucide-react';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Mail size={20} strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <h1>Newsletter Builder</h1>
          </div>
        </div>

        <div className="header-actions">
          <span className="badge">v1.0</span>
        </div>
      </div>

      <style>{`
        .app-header {
          padding: 16px 32px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 100%;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: var(--accent-gradient);
          border-radius: 10px;
          color: white;
        }
        
        .logo-text h1 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </header>
  );
}

export default Header;
