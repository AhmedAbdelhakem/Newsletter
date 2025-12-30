import React, { useState } from 'react';

const PageSettings = ({ settings, onChange }) => {
    const handleChange = (key, value) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="page-settings">
            <div className="section-title">Light Mode (Default)</div>

            <div className="settings-group">
                <label className="settings-label">Page Background</label>
                <div className="color-input-wrapper">
                    <input
                        type="color"
                        value={settings.backgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="color-picker"
                    />
                    <input
                        type="text"
                        value={settings.backgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="color-text"
                    />
                </div>
            </div>

            <div className="settings-group">
                <label className="settings-label">Content Background</label>
                <div className="color-input-wrapper">
                    <input
                        type="color"
                        value={settings.contentBackgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('contentBackgroundColor', e.target.value)}
                        className="color-picker"
                    />
                    <input
                        type="text"
                        value={settings.contentBackgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('contentBackgroundColor', e.target.value)}
                        className="color-text"
                    />
                </div>
                <p className="help-text">The background of the email card itself.</p>
            </div>

            <hr className="divider" />

            <div className="settings-group">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={settings.darkModeSupport}
                        onChange={(e) => handleChange('darkModeSupport', e.target.checked)}
                    />
                    Dark Mode Support
                </label>
                <p className="help-text">
                    Customize how your email looks on devices in Dark Mode.
                </p>
            </div>

            {settings.darkModeSupport && (
                <div className="dark-mode-options">
                    <div className="section-title" style={{ marginTop: '0' }}>Dark Mode Colors</div>

                    <div className="settings-group">
                        <label className="settings-label">Page Background (Dark)</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={settings.darkModePageColor || '#1a1a1a'}
                                onChange={(e) => handleChange('darkModePageColor', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={settings.darkModePageColor || '#1a1a1a'}
                                onChange={(e) => handleChange('darkModePageColor', e.target.value)}
                                className="color-text"
                            />
                        </div>
                    </div>

                    <div className="settings-group">
                        <label className="settings-label">Content Background (Dark)</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={settings.darkModeContentColor || '#2d2d2d'}
                                onChange={(e) => handleChange('darkModeContentColor', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={settings.darkModeContentColor || '#2d2d2d'}
                                onChange={(e) => handleChange('darkModeContentColor', e.target.value)}
                                className="color-text"
                            />
                        </div>
                    </div>

                    <div className="settings-group">
                        <label className="settings-label">Text Color (Dark)</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={settings.darkModeTextColor || '#e5e5e5'}
                                onChange={(e) => handleChange('darkModeTextColor', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={settings.darkModeTextColor || '#e5e5e5'}
                                onChange={(e) => handleChange('darkModeTextColor', e.target.value)}
                                className="color-text"
                            />
                        </div>
                    </div>
                </div>
            )}

            <hr className="divider" />

            <div className="section-title">Page Background (Outer)</div>

            <div className="settings-group">
                <label className="settings-label">Page Image URL</label>
                <input
                    type="text"
                    value={settings.backgroundImage || ''}
                    onChange={(e) => handleChange('backgroundImage', e.target.value)}
                    placeholder="https://..."
                    className="settings-input"
                />
            </div>

            <div className="settings-group">
                <label className="settings-label">Page Video URL</label>
                <input
                    type="text"
                    value={settings.backgroundVideo || ''}
                    onChange={(e) => handleChange('backgroundVideo', e.target.value)}
                    placeholder="https://... (mp4)"
                    className="settings-input"
                />
            </div>

            <hr className="divider" />

            <div className="section-title">Content Background (Inner)</div>

            <div className="settings-group">
                <label className="settings-label">Content Image URL</label>
                <input
                    type="text"
                    value={settings.contentBackgroundImage || ''}
                    onChange={(e) => handleChange('contentBackgroundImage', e.target.value)}
                    placeholder="https://..."
                    className="settings-input"
                />
            </div>

            <div className="settings-group">
                <label className="settings-label">Content Video URL</label>
                <input
                    type="text"
                    value={settings.contentBackgroundVideo || ''}
                    onChange={(e) => handleChange('contentBackgroundVideo', e.target.value)}
                    placeholder="https://... (mp4)"
                    className="settings-input"
                />
                <p className="help-text">
                    Plays behind the mail card content.
                </p>
            </div>

            <style>{`
        .page-settings {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .settings-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }
        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .color-picker {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: pointer;
        }
        .color-text {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-family: monospace;
        }
        .settings-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
        }
        .settings-input:focus, .color-text:focus {
          outline: none;
          border-color: #6366f1;
        }
        .toggle-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
        }
        .help-text {
            font-size: 11px;
            color: #6b7280;
            margin: 0;
        }
        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 0;
        }
        .dark-mode-options {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
      `}</style>
        </div>
    );
};

export default PageSettings;
