const defaultState = {
  url: '',
  alt: '',
  width: '100',
  alignment: 'center',
  borderRadius: '0',
  border: 'none',
  shadow: 'none'
};

export default class ImageUrlBlock {
  static get toolbox() {
    return {
      title: 'Image URL',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>'
    };
  }

  constructor({ data, api }) {
    this.data = { ...defaultState, ...data };
    this.api = api;
    this.wrapper = undefined;
    this.preview = null;
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

    const urlInput = this.createInput('Image URL', 'url', this.data.url, 'https://example.com/image.jpg', value => {
      this.data.url = value;
      this.updatePreview();
    });

    const altInput = this.createInput('Alt Text', 'text', this.data.alt, 'Image description', value => {
      this.data.alt = value;
    });

    urlSection.append(urlInput, altInput);

    // Style Settings Panel
    const stylePanel = document.createElement('div');
    stylePanel.style.cssText = 'background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px;';

    const stylePanelHeader = document.createElement('div');
    stylePanelHeader.style.cssText = 'font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;';
    stylePanelHeader.textContent = 'Style Settings';
    stylePanel.appendChild(stylePanelHeader);

    const styleGrid = document.createElement('div');
    styleGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;';

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

    // Alignment
    const alignInput = this.createSelectInput('Alignment', this.data.alignment, [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ], value => {
      this.data.alignment = value;
      this.updatePreview();
    });

    // Border
    const borderInput = this.createSelectInput('Border', this.data.border, [
      { value: 'none', label: 'None' },
      { value: '1px solid #e5e7eb', label: 'Light' },
      { value: '2px solid #cbd5e1', label: 'Medium' },
      { value: '3px solid #6366f1', label: 'Accent' }
    ], value => {
      this.data.border = value;
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

    styleGrid.append(widthInput, radiusInput, alignInput, borderInput, shadowInput);
    stylePanel.appendChild(styleGrid);

    // Preview
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = 'background: #f1f5f9; border-radius: 8px; padding: 16px; min-height: 120px; display: flex; justify-content: center; align-items: center;';

    this.preview = document.createElement('img');
    this.preview.alt = this.data.alt || '';
    this.preview.style.cssText = 'max-height: 200px; object-fit: contain; transition: all 0.2s ease;';

    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'color: #94a3b8; font-size: 13px; text-align: center;';
    placeholder.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><br>Enter image URL above';

    previewContainer.appendChild(this.data.url ? this.preview : placeholder);
    this.updatePreview();

    this.wrapper.append(urlSection, stylePanel, previewContainer);

    // Store previewContainer for updates
    this.previewContainer = previewContainer;
    this.placeholder = placeholder;

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

  updatePreview() {
    if (!this.preview || !this.previewContainer) return;

    if (this.data.url) {
      this.preview.src = this.data.url;
      this.preview.alt = this.data.alt;
      this.preview.style.width = `${this.data.width}%`;
      this.preview.style.borderRadius = `${this.data.borderRadius}px`;
      this.preview.style.border = this.data.border;
      this.preview.style.boxShadow = this.data.shadow;

      this.previewContainer.innerHTML = '';
      this.previewContainer.style.justifyContent = this.data.alignment === 'left' ? 'flex-start' :
        this.data.alignment === 'right' ? 'flex-end' : 'center';
      this.previewContainer.appendChild(this.preview);
    } else {
      this.previewContainer.innerHTML = '';
      this.previewContainer.style.justifyContent = 'center';
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
