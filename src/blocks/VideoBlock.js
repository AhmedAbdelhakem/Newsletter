const defaultState = {
    url: '',
    posterUrl: '', // Fallback image for email clients that don't support video (like Gmail)
    alt: 'Video',
    width: '100',
    alignment: 'center',
    borderRadius: '0',
    border: 'none',
    shadow: 'none',
    autoPlay: true,
    muted: true,
    loop: true,
    controls: true
};

export default class VideoBlock {
    static get toolbox() {
        return {
            title: 'Video / SVG',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>'
        };
    }

    constructor({ data, api }) {
        this.data = { ...defaultState, ...data };
        this.api = api;
        this.wrapper = undefined;
        this.preview = null;
    }

    getVideoType(url) {
        if (!url) return 'image';
        const extension = url.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) return 'video';
        return 'image';
    }

    // Dispatch change for real-time preview updates
    dispatchChange() {
        this.wrapper?.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

        // URL Input Section
        const urlSection = document.createElement('div');
        urlSection.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        const urlInput = this.createInput('Video/SVG URL', 'url', this.data.url, 'https://example.com/video.mp4', value => {
            this.data.url = value;
            this.updatePreview();
        });

        // Poster URL - REQUIRED for Gmail/Outlook fallback (these clients don't support video)
        const posterInput = this.createInput('Poster Image URL (Gmail fallback)', 'url', this.data.posterUrl || '', 'https://example.com/poster.jpg', value => {
            this.data.posterUrl = value;
        });

        const altInput = this.createInput('Alt Text', 'text', this.data.alt, 'Description', value => {
            this.data.alt = value;
        });

        // Info box explaining poster importance
        const infoBox = document.createElement('div');
        infoBox.style.cssText = 'background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 8px 10px; font-size: 11px; color: #1e40af; margin-top: 4px;';
        infoBox.innerHTML = 'ℹ️ <strong>Gmail/Outlook strip video tags.</strong> Add a poster image URL so those users see an image instead of a broken icon.';

        urlSection.append(urlInput, posterInput, infoBox, altInput);

        // Style Settings Panel
        const stylePanel = document.createElement('div');
        stylePanel.style.cssText = 'background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px;';

        const stylePanelHeader = document.createElement('div');
        stylePanelHeader.style.cssText = 'font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;';
        stylePanelHeader.textContent = 'Settings';
        stylePanel.appendChild(stylePanelHeader);

        const styleGrid = document.createElement('div');
        styleGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;';

        // Width
        const widthInput = this.createRangeInput('Width', this.data.width, '%', 10, 100, value => {
            this.data.width = value;
            this.updatePreview();
        });

        // Border Radius
        const radiusInput = this.createRangeInput('Corners', this.data.borderRadius, 'px', 0, 50, value => {
            this.data.borderRadius = value;
            this.updatePreview();
        });

        styleGrid.append(widthInput, radiusInput);

        // Video Options (Autoplay, Mute, Loop)
        const optionsGrid = document.createElement('div');
        optionsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;';

        const autoplayCheck = this.createCheckbox('Autoplay', this.data.autoPlay, checked => {
            this.data.autoPlay = checked;
            this.updatePreview();
        });

        const muteCheck = this.createCheckbox('Muted', this.data.muted, checked => {
            this.data.muted = checked;
            this.updatePreview();
        });

        const loopCheck = this.createCheckbox('Loop', this.data.loop, checked => {
            this.data.loop = checked;
            this.updatePreview();
        });

        optionsGrid.append(autoplayCheck, muteCheck, loopCheck);

        // Layout
        const layoutGrid = document.createElement('div');
        layoutGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;';

        // Alignment
        const alignInput = this.createSelectInput('Alignment', this.data.alignment, [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
        ], value => {
            this.data.alignment = value;
            this.updatePreview();
        });

        // Shadow
        const shadowInput = this.createSelectInput('Shadow', this.data.shadow, [
            { value: 'none', label: 'None' },
            { value: '0 2px 8px rgba(0,0,0,0.1)', label: 'Small' },
            { value: '0 4px 16px rgba(0,0,0,0.15)', label: 'Medium' },
            { value: '0 8px 30px rgba(0,0,0,0.2)', label: 'Large' }
        ], value => {
            this.data.shadow = value;
            this.updatePreview();
        });

        layoutGrid.append(alignInput, shadowInput);

        stylePanel.append(styleGrid, optionsGrid, layoutGrid);

        // Preview
        const previewContainer = document.createElement('div');
        previewContainer.style.cssText = 'background: #f1f5f9; border-radius: 8px; padding: 16px; min-height: 120px; display: flex; justify-content: center; align-items: center;';

        this.previewContainer = previewContainer;

        // Create separate elements for video and image previews
        this.videoPreview = document.createElement('video');
        this.videoPreview.style.cssText = 'max-height: 200px; object-fit: contain; transition: all 0.2s ease;';

        this.imagePreview = document.createElement('img');
        this.imagePreview.style.cssText = 'max-height: 200px; object-fit: contain; transition: all 0.2s ease;';

        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'color: #94a3b8; font-size: 13px; text-align: center;';
        placeholder.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg><br>Enter video/SVG URL';

        this.placeholder = placeholder;

        this.updatePreview();

        this.wrapper.append(urlSection, stylePanel, previewContainer);

        return this.wrapper;
    }

    createInput(label, type, value, placeholder, onChange) {
        const wrapper = document.createElement('div');
        const labelEl = document.createElement('label');
        labelEl.style.cssText = 'display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
        labelEl.textContent = label;
        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.placeholder = placeholder;
        input.style.cssText = 'width: 100%; padding: 8px 10px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; font-family: inherit;';
        input.addEventListener('input', e => onChange(e.target.value));
        wrapper.append(labelEl, input);
        return wrapper;
    }

    createRangeInput(label, value, unit, min, max, onChange) {
        const wrapper = document.createElement('div');
        const labelRow = document.createElement('div');
        labelRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';

        const labelEl = document.createElement('span');
        labelEl.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 500;';
        labelEl.textContent = label;

        const valueEl = document.createElement('span');
        valueEl.style.cssText = 'font-size: 11px; color: #6366f1; font-weight: 600;';
        valueEl.textContent = `${value}${unit}`;

        labelRow.append(labelEl, valueEl);

        const range = document.createElement('input');
        range.type = 'range';
        range.min = min;
        range.max = max;
        range.value = value;
        range.style.cssText = 'width: 100%; cursor: pointer; accent-color: #6366f1;';
        range.addEventListener('input', e => {
            valueEl.textContent = `${e.target.value}${unit}`;
            onChange(e.target.value);
        });

        wrapper.append(labelRow, range);
        return wrapper;
    }

    createSelectInput(label, value, options, onChange) {
        const wrapper = document.createElement('div');
        const labelEl = document.createElement('label');
        labelEl.style.cssText = 'display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
        labelEl.textContent = label;

        const select = document.createElement('select');
        select.style.cssText = 'width: 100%; padding: 6px 8px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;';

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === value) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', e => onChange(e.target.value));
        wrapper.append(labelEl, select);
        return wrapper;
    }

    createCheckbox(label, checked, onChange) {
        const wrapper = document.createElement('label');
        wrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 11px; color: #475569; font-weight: 500;';

        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = checked;
        box.style.cssText = 'cursor: pointer; accent-color: #6366f1;';

        box.addEventListener('change', e => onChange(e.target.checked));

        wrapper.append(box, label);
        return wrapper;
    }

    updatePreview() {
        if (!this.previewContainer) return;

        this.previewContainer.innerHTML = '';
        this.previewContainer.style.justifyContent = this.data.alignment === 'left' ? 'flex-start' :
            this.data.alignment === 'right' ? 'flex-end' : 'center';

        if (this.data.url) {
            const type = this.getVideoType(this.data.url);
            let el;

            if (type === 'video') {
                el = this.videoPreview;
                el.src = this.data.url;
                el.autoplay = this.data.autoPlay;
                el.loop = this.data.loop;
                el.muted = this.data.muted;
                el.controls = true; // Always show controls in editor so user can play/pause
            } else {
                el = this.imagePreview;
                el.src = this.data.url;
            }

            el.alt = this.data.alt;
            el.style.width = `${this.data.width}%`;
            el.style.borderRadius = `${this.data.borderRadius}px`;
            el.style.boxShadow = this.data.shadow;

            this.previewContainer.appendChild(el);
        } else {
            this.previewContainer.appendChild(this.placeholder);
        }

        // Trigger preview update
        this.dispatchChange();
    }

    save() {
        return this.data;
    }

    validate(savedData) {
        return !!savedData.url;
    }
}
