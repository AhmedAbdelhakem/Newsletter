const defaultState = {
  label: 'Click Me',
  url: 'https://',
  bgColor: '#6366f1',
  textColor: '#ffffff',
  borderRadius: '8',
  paddingX: '24',
  paddingY: '12',
  fontSize: '15',
  fontWeight: 'bold',
  alignment: 'center',
  fullWidth: false
};

export default class ButtonBlock {
  static get toolbox() {
    return {
      title: 'Button',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/></svg>'
    };
  }

  constructor({ data, api }) {
    this.data = { ...defaultState, ...data };
    this.api = api;
    this.preview = null;
    this.wrapper = null;
  }

  // Dispatch change for real-time preview updates
  dispatchChange() {
    this.wrapper?.dispatchEvent(new CustomEvent('input', { bubbles: true }));
  }

  render() {
    const wrapper = document.createElement('div');
    this.wrapper = wrapper; // Store reference for dispatchChange
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Content Section
    const contentSection = document.createElement('div');
    contentSection.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;';

    const labelInput = this.createInput('Button Text', 'text', this.data.label, 'Click Me', value => {
      this.data.label = value;
      this.updatePreview();
    });

    const urlInput = this.createInput('Link URL', 'url', this.data.url, 'https://...', value => {
      this.data.url = value;
    });

    contentSection.append(labelInput, urlInput);

    // Colors Section
    const colorsSection = document.createElement('div');
    colorsSection.style.cssText = 'display: flex; gap: 12px;';

    const bgColorInput = this.createColorInput('Background', this.data.bgColor, value => {
      this.data.bgColor = value;
      this.updatePreview();
    });

    const textColorInput = this.createColorInput('Text Color', this.data.textColor, value => {
      this.data.textColor = value;
      this.updatePreview();
    });

    colorsSection.append(bgColorInput, textColorInput);

    // Style Settings Panel
    const stylePanel = document.createElement('div');
    stylePanel.style.cssText = 'background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px;';

    const stylePanelHeader = document.createElement('div');
    stylePanelHeader.style.cssText = 'font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;';
    stylePanelHeader.textContent = 'Style Settings';
    stylePanel.appendChild(stylePanelHeader);

    const styleGrid = document.createElement('div');
    styleGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;';

    // Border Radius
    const radiusInput = this.createRangeInput('Corners', this.data.borderRadius, 'px', 0, 30, value => {
      this.data.borderRadius = value;
      this.updatePreview();
    });

    // Padding X
    const paddingXInput = this.createRangeInput('Padding X', this.data.paddingX, 'px', 8, 48, value => {
      this.data.paddingX = value;
      this.updatePreview();
    });

    // Padding Y
    const paddingYInput = this.createRangeInput('Padding Y', this.data.paddingY, 'px', 6, 24, value => {
      this.data.paddingY = value;
      this.updatePreview();
    });

    // Font Size
    const fontSizeInput = this.createRangeInput('Font Size', this.data.fontSize, 'px', 12, 24, value => {
      this.data.fontSize = value;
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

    // Font Weight
    const weightInput = this.createSelectInput('Font Weight', this.data.fontWeight, [
      { value: 'normal', label: 'Normal' },
      { value: 'bold', label: 'Bold' }
    ], value => {
      this.data.fontWeight = value;
      this.updatePreview();
    });

    styleGrid.append(radiusInput, paddingXInput, paddingYInput, fontSizeInput, alignInput, weightInput);
    stylePanel.appendChild(styleGrid);

    // Full Width Toggle
    const fullWidthRow = document.createElement('div');
    fullWidthRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.data.fullWidth;
    checkbox.style.cssText = 'width: 16px; height: 16px; accent-color: #6366f1; cursor: pointer;';
    checkbox.addEventListener('change', e => {
      this.data.fullWidth = e.target.checked;
      this.updatePreview();
    });

    const checkLabel = document.createElement('span');
    checkLabel.style.cssText = 'font-size: 12px; color: #374151;';
    checkLabel.textContent = 'Full width button';

    fullWidthRow.append(checkbox, checkLabel);
    stylePanel.appendChild(fullWidthRow);

    // Preview
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = 'background: #f1f5f9; border-radius: 8px; padding: 20px; display: flex;';

    this.preview = document.createElement('a');
    this.preview.href = '#';
    this.preview.target = '_blank';
    this.preview.style.cssText = 'text-decoration: none; display: inline-block; transition: all 0.2s ease;';

    previewContainer.appendChild(this.preview);
    this.previewContainer = previewContainer;
    this.updatePreview();

    wrapper.append(contentSection, colorsSection, stylePanel, previewContainer);
    return wrapper;
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

  createColorInput(label, value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'flex: 1;';
    const labelEl = document.createElement('label');
    labelEl.style.cssText = 'display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
    labelEl.textContent = label;
    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 8px; background: white;';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = value;
    colorInput.style.cssText = 'width: 24px; height: 24px; border: none; padding: 0; cursor: pointer; border-radius: 4px;';
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = value;
    textInput.style.cssText = 'flex: 1; border: none; font-size: 12px; font-family: monospace; width: 60px;';

    colorInput.addEventListener('input', e => {
      textInput.value = e.target.value;
      onChange(e.target.value);
    });
    textInput.addEventListener('input', e => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorInput.value = e.target.value;
      }
      onChange(e.target.value);
    });

    inputWrapper.append(colorInput, textInput);
    wrapper.append(labelEl, inputWrapper);
    return wrapper;
  }

  createRangeInput(label, value, unit, min, max, onChange) {
    const wrapper = document.createElement('div');
    const labelRow = document.createElement('div');
    labelRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';

    const labelEl = document.createElement('span');
    labelEl.style.cssText = 'font-size: 10px; color: #64748b; font-weight: 500;';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = 'font-size: 10px; color: #6366f1; font-weight: 600;';
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
    labelEl.style.cssText = 'display: block; font-size: 10px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; padding: 5px 6px; font-size: 11px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;';

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

    this.preview.textContent = this.data.label;
    this.preview.style.backgroundColor = this.data.bgColor;
    this.preview.style.color = this.data.textColor;
    this.preview.style.borderRadius = `${this.data.borderRadius}px`;
    this.preview.style.padding = `${this.data.paddingY}px ${this.data.paddingX}px`;
    this.preview.style.fontSize = `${this.data.fontSize}px`;
    this.preview.style.fontWeight = this.data.fontWeight;
    this.preview.style.width = this.data.fullWidth ? '100%' : 'auto';
    this.preview.style.textAlign = 'center';

    this.previewContainer.style.justifyContent = this.data.alignment === 'left' ? 'flex-start' :
      this.data.alignment === 'right' ? 'flex-end' : 'center';

    // Trigger preview update
    this.dispatchChange();
  }

  save() {
    return this.data;
  }
}
