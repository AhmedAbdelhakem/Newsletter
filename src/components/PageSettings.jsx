import React, { useState } from 'react';

const PageSettings = ({ settings, onChange }) => {
    const handleChange = (key, value) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="flex flex-col gap-5 p-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Light Mode (Default)</div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Page Background</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={settings.backgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                        type="text"
                        value={settings.backgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="flex-1 py-1.5 px-2.5 border border-gray-200 rounded-md text-[13px] font-mono focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Content Background</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={settings.contentBackgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('contentBackgroundColor', e.target.value)}
                        className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                        type="text"
                        value={settings.contentBackgroundColor || '#ffffff'}
                        onChange={(e) => handleChange('contentBackgroundColor', e.target.value)}
                        className="flex-1 py-1.5 px-2.5 border border-gray-200 rounded-md text-[13px] font-mono focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <p className="text-[11px] text-gray-500 m-0">The background of the email card itself.</p>
            </div>

            <hr className="border-0 border-t border-gray-200 m-0" />

            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[13px] font-medium cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={settings.darkModeSupport}
                        onChange={(e) => handleChange('darkModeSupport', e.target.checked)}
                    />
                    Dark Mode Support
                </label>
                <p className="text-[11px] text-gray-500 m-0">
                    Customize how your email looks on devices in Dark Mode.
                </p>
            </div>

            {settings.darkModeSupport && (
                <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0">Dark Mode Colors</div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-gray-700">Page Background (Dark)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.darkModePageColor || '#1a1a1a'}
                                onChange={(e) => handleChange('darkModePageColor', e.target.value)}
                                className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={settings.darkModePageColor || '#1a1a1a'}
                                onChange={(e) => handleChange('darkModePageColor', e.target.value)}
                                className="flex-1 py-1.5 px-2.5 border border-gray-200 rounded-md text-[13px] font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-gray-700">Content Background (Dark)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.darkModeContentColor || '#2d2d2d'}
                                onChange={(e) => handleChange('darkModeContentColor', e.target.value)}
                                className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={settings.darkModeContentColor || '#2d2d2d'}
                                onChange={(e) => handleChange('darkModeContentColor', e.target.value)}
                                className="flex-1 py-1.5 px-2.5 border border-gray-200 rounded-md text-[13px] font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-gray-700">Text Color (Dark)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settings.darkModeTextColor || '#e5e5e5'}
                                onChange={(e) => handleChange('darkModeTextColor', e.target.value)}
                                className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={settings.darkModeTextColor || '#e5e5e5'}
                                onChange={(e) => handleChange('darkModeTextColor', e.target.value)}
                                className="flex-1 py-1.5 px-2.5 border border-gray-200 rounded-md text-[13px] font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            <hr className="border-0 border-t border-gray-200 m-0" />

            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Page Background (Outer)</div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Page Image URL</label>
                <input
                    type="text"
                    value={settings.backgroundImage || ''}
                    onChange={(e) => handleChange('backgroundImage', e.target.value)}
                    placeholder="https://..."
                    className="w-full py-2 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-500"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Page Video URL</label>
                <input
                    type="text"
                    value={settings.backgroundVideo || ''}
                    onChange={(e) => handleChange('backgroundVideo', e.target.value)}
                    placeholder="https://... (mp4)"
                    className="w-full py-2 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-500"
                />
            </div>

            <hr className="border-0 border-t border-gray-200 m-0" />

            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Content Background (Inner)</div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Content Image URL</label>
                <input
                    type="text"
                    value={settings.contentBackgroundImage || ''}
                    onChange={(e) => handleChange('contentBackgroundImage', e.target.value)}
                    placeholder="https://..."
                    className="w-full py-2 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-500"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-gray-700">Content Video URL</label>
                <input
                    type="text"
                    value={settings.contentBackgroundVideo || ''}
                    onChange={(e) => handleChange('contentBackgroundVideo', e.target.value)}
                    placeholder="https://... (mp4)"
                    className="w-full py-2 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-gray-500 m-0">
                    Plays behind the mail card content.
                </p>
            </div>
        </div>
    );
};

export default PageSettings;
