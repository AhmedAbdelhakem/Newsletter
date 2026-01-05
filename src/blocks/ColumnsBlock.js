
const CONTENT_TYPES = ['text', 'button', 'image', 'link', 'linkPreview', 'row'];

const defaultState = {
  columns: 2,
  content: [
    [{ type: 'text', value: 'Column 1 content' }],
    [{ type: 'text', value: 'Column 2 content' }]
  ]
};

export default class ColumnsBlock {
  static get toolbox() {
    return {
      title: 'Columns',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
    };
  }

  constructor({ data, api, block }) {
    this.api = api;
    this.block = block;

    let content = data?.content || defaultState.content;
    content = content.map(column => {
      if (!Array.isArray(column)) return [{ type: 'text', value: '' }];
      return column.map(item => {
        if (typeof item === 'string') {
          return { type: 'text', value: item };
        }
        // Ensure 'row' type has default content structure
        if (item.type === 'row' && !item.content) {
          return { ...item, ...this.getDefaultContent('row') };
        }
        return item;
      });
    });

    this.data = {
      columns: data?.columns || defaultState.columns,
      content
    };
  }

  // Dispatch block change to trigger Editor.js save
  dispatchChange() {
    if (this.api && this.api.blocks) {
      // Trigger Editor.js onChange by dispatching a custom event
      this.wrapper?.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    }
  }

  render() {
    const wrapper = document.createElement('div');
    this.wrapper = wrapper; // Store reference for dispatchChange
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Column count selector
    const selectorRow = document.createElement('div');
    selectorRow.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const label = document.createElement('span');
    label.textContent = 'Layout';
    label.style.cssText = 'font-size: 12px; color: #64748b; font-weight: 500;';

    const selector = document.createElement('select');
    selector.style.cssText = 'padding: 6px 10px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;';
    [1, 2, 3].forEach(count => {
      const option = document.createElement('option');
      option.value = count;
      option.textContent = `${count} columns`;
      if (count === this.data.columns) option.selected = true;
      selector.appendChild(option);
    });
    selector.addEventListener('change', event => {
      this.data.columns = Number(event.target.value);
      while (this.data.content.length < this.data.columns) {
        this.data.content.push([{ type: 'text', value: 'New column' }]);
      }
      this.data.content = this.data.content.slice(0, this.data.columns);
      renderEditors();
      this.dispatchChange();
    });

    selectorRow.append(label, selector);
    wrapper.appendChild(selectorRow);

    // Block Styling (Background & Padding)
    const styleRow = document.createElement('div');
    styleRow.style.cssText = 'display: flex; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;';

    styleRow.append(
      this.createColorInput('Bg Color', this.data.backgroundColor || '#ffffff', v => { this.data.backgroundColor = v; this.dispatchChange(); }),
      this.createRangeInput('Padding Y', this.data.paddingY || '0', 'px', 0, 60, v => { this.data.paddingY = v; this.dispatchChange(); })
    );

    const bgImageRow = document.createElement('div');
    bgImageRow.style.cssText = 'margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;';

    bgImageRow.append(
      this.createInput('Background Image URL', 'url', this.data.backgroundImage || '', v => {
        this.data.backgroundImage = v;
        if (v) this.data.backgroundColor = 'transparent'; // Reset color if media set
        this.dispatchChange();
      }),
      this.createInput('Background Video URL (mp4/webm)', 'url', this.data.backgroundVideo || '', v => {
        this.data.backgroundVideo = v;
        if (v) this.data.backgroundColor = 'transparent'; // Reset color if media set
        this.dispatchChange();
      })
    );

    const bgSettingsRow = document.createElement('div');
    bgSettingsRow.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;';
    bgSettingsRow.append(
      this.createSelectInput('Bg Size', this.data.backgroundSize || 'cover', [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
        { value: 'auto', label: 'Auto' }
      ], v => { this.data.backgroundSize = v; this.dispatchChange(); }),
      this.createSelectInput('Bg Position', this.data.backgroundPosition || 'center center', [
        { value: 'center center', label: 'Center' },
        { value: 'top center', label: 'Top' },
        { value: 'bottom center', label: 'Bottom' },
        { value: 'left center', label: 'Left' },
        { value: 'right center', label: 'Right' }
      ], v => { this.data.backgroundPosition = v; this.dispatchChange(); })
    );

    wrapper.appendChild(styleRow);
    wrapper.appendChild(bgImageRow);
    wrapper.appendChild(bgSettingsRow);

    const colsContainer = document.createElement('div');
    colsContainer.style.cssText = 'display: grid; gap: 16px;';

    const renderEditors = () => {
      colsContainer.innerHTML = '';
      colsContainer.style.gridTemplateColumns = `repeat(${this.data.columns}, minmax(0, 1fr))`;

      this.data.content.forEach((column, colIndex) => {
        this.renderColumn(colIndex, column, colsContainer);
      });
    };

    renderEditors();
    wrapper.appendChild(colsContainer);
    return wrapper;
  }

  renderColumn(colIndex, column, container, isNested = false) {
    const colWrapper = document.createElement('div');
    // Use semi-transparent background for editor UI to hints at structure without blocking parent background
    // transparent is best for "disappear", but let's use a very faint white for structure if needed. 
    // User asked for "disappear", so let's go with transparent but keep the border.
    colWrapper.style.cssText = `background: transparent; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; `;
    if (isNested) colWrapper.style.border = '1px dashed #cbd5e1';

    const colLabel = document.createElement('div');
    colLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;';
    colLabel.textContent = `Column ${colIndex + 1} `;
    colWrapper.appendChild(colLabel);

    const itemsContainer = document.createElement('div');
    itemsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    const renderItems = () => {
      itemsContainer.innerHTML = '';
      column.forEach((item, itemIndex) => {
        const itemWrapper = this.createContentItem(item, (key, value) => {
          // Update callback
          item[key] = value;
        }, () => {
          // Delete callback
          column.splice(itemIndex, 1);
          if (column.length === 0 && !isNested) column.push({ type: 'text', value: '' }); // Keep at least one item in main columns
          renderItems();
        });
        itemsContainer.appendChild(itemWrapper);
      });
    };

    renderItems();

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.style.cssText = 'width: 100%; margin-top: 10px; padding: 8px 12px; font-size: 12px; color: #6366f1; background: transparent; border: 1px dashed #c7d2fe; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s;';
    addBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Item';
    addBtn.onmouseenter = () => { addBtn.style.background = '#eef2ff'; addBtn.style.borderColor = '#a5b4fc'; };
    addBtn.onmouseleave = () => { addBtn.style.background = 'transparent'; addBtn.style.borderColor = '#c7d2fe'; };
    addBtn.addEventListener('click', () => {
      this.showContentTypeMenu(addBtn, (type) => {
        column.push(this.getDefaultContent(type));
        renderItems();
      });
    });

    colWrapper.append(itemsContainer, addBtn);
    container.appendChild(colWrapper);
  }

  createContentItem(item, onUpdate, onDelete) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; position: relative;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;';

    const typeBadge = document.createElement('span');
    typeBadge.style.cssText = 'font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;';
    typeBadge.textContent = item.type;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.style.cssText = 'padding: 4px; background: none; border: none; color: #94a3b8; cursor: pointer; line-height: 1; border-radius: 4px;';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    deleteBtn.onmouseenter = () => { deleteBtn.style.color = '#ef4444'; deleteBtn.style.background = '#fef2f2'; };
    deleteBtn.onmouseleave = () => { deleteBtn.style.color = '#94a3b8'; deleteBtn.style.background = 'none'; };
    deleteBtn.addEventListener('click', onDelete);

    header.append(typeBadge, deleteBtn);
    wrapper.appendChild(header);

    const content = this.createContentEditor(item, onUpdate);
    wrapper.appendChild(content);

    return wrapper;
  }

  createContentEditor(item, onUpdate) {
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    // Generic update helper - triggers dispatchChange for real-time preview
    const update = (key, value) => {
      item[key] = value; // Update local ref
      onUpdate(key, value); // Trigger upstream
      this.dispatchChange(); // Trigger preview update
    }

    switch (item.type) {
      case 'text':
        const textarea = document.createElement('textarea');
        textarea.value = item.value || '';
        textarea.placeholder = 'Enter text...';
        textarea.style.cssText = 'width: 100%; padding: 8px 10px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; font-family: inherit; min-height: 60px; resize: vertical;';
        textarea.addEventListener('input', e => update('value', e.target.value));
        container.appendChild(textarea);

        // Typography Controls
        const typoControls = document.createElement('div');
        typoControls.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 8px;';

        // Font Size Select
        const fontSizes = ['Default', '12px', '14px', '15px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];
        typoControls.appendChild(
          this.createSelectInput('Font Size', item.fontSize || '', fontSizes.map(s => ({ value: s === 'Default' ? '' : s, label: s })), v => update('fontSize', v))
        );

        // Font Family Select
        const fontFamilies = [
          { value: '', label: 'Default' },
          { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
          { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
          { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
          { value: 'Georgia, serif', label: 'Georgia' },
          { value: '"Courier New", Courier, monospace', label: 'Courier New' },
          { value: 'Roboto, Arial, sans-serif', label: 'Roboto' },
          { value: '"Red Hat Display", sans-serif', label: 'Red Hat Display' },
          { value: 'Archivo, sans-serif', label: 'Archivo' },
        ];
        typoControls.appendChild(
          this.createSelectInput('Font Family', item.fontFamily || '', fontFamilies, v => update('fontFamily', v))
        );

        // Color picker (spans full width)
        const colorWrapper = document.createElement('div');
        colorWrapper.style.cssText = 'grid-column: span 2;';
        colorWrapper.appendChild(
          this.createColorInput('Text Color', item.color || '#1f2937', v => update('color', v))
        );
        typoControls.appendChild(colorWrapper);

        container.appendChild(typoControls);
        break;

      case 'linkPreview':
        // State for local view management (Input vs Preview vs Edit)
        // We use a container that we will empty and refill based on state
        const lpContainer = document.createElement('div');
        lpContainer.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

        const renderLP = () => {
          lpContainer.innerHTML = '';

          // Check if we have data to show preview
          if (item.link && item.meta && item.meta.title) {
            renderLPPreview();
          } else {
            renderLPInput();
          }
        };

        const renderLPInput = () => {
          const input = document.createElement('input');
          input.placeholder = 'Paste link URL...';
          input.value = item.link || '';
          input.style.cssText = 'width: 100%; padding: 8px 10px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px;';

          const handleUrl = async (url) => {
            if (!url) return;
            lpContainer.innerHTML = '<div style="font-size:12px;color:#6b7280;">Fetching metadata...</div>';
            try {
              const response = await fetch(`http://localhost:3001/api/fetch-url-metadata?url=${encodeURIComponent(url)}`);
              const result = await response.json();
              if (result.success) {
                update('link', url);
                update('meta', result.meta);
                // Default style if not exists
                if (!item.style) {
                  update('style', {
                    display: 'row',
                    backgroundColor: '#ffffff',
                    borderColor: '#e1e3e6',
                    borderRadius: '6',
                    borderWidth: '1',
                    padding: '0',
                    titleColor: '#111827',
                    titleFontSize: '14', // Slightly smaller default for columns
                    descColor: '#6b7280',
                    descFontSize: '12',
                    imageRadius: '6'
                  });
                }
                renderLP();
              } else {
                // Fallback to basic link or error? Just go back to input
                renderLPInput();
                const inp = lpContainer.querySelector('input');
                if (inp) { inp.value = url; inp.style.borderColor = 'red'; }
              }
            } catch (e) {
              console.error(e);
              renderLPInput();
            }
          };

          input.addEventListener('paste', (e) => {
            const url = (e.clipboardData || window.clipboardData).getData('text');
            handleUrl(url);
          });
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleUrl(input.value);
          });

          lpContainer.appendChild(input);
        };

        const renderLPPreview = () => {
          const s = item.style || {};
          const isColumn = s.display === 'column';

          const preview = document.createElement('div');
          preview.style.cssText = `border:${s.borderWidth}px solid ${s.borderColor}; border-radius:${s.borderRadius}px; background:${s.backgroundColor}; padding:${s.padding}px; overflow:hidden; display:flex; flex-direction:${isColumn ? 'column' : 'row'}; align-items:${isColumn ? 'flex-start' : 'center'}; position:relative;`;

          // Image
          if (item.meta.image && item.meta.image.url) {
            const imgWrapper = document.createElement('div');
            if (isColumn) {
              imgWrapper.style.cssText = `width:100%; margin-bottom:12px;`;
              imgWrapper.innerHTML = `<img src="${item.meta.image.url}" style="width:100%; height:auto; aspect-ratio:16/9; object-fit:cover; border-radius:${s.imageRadius}px; display:block;">`;
            } else {
              imgWrapper.style.cssText = `width:60px; height:60px; flex-shrink:0; background:#f4f5f7; margin:10px; border-radius:${s.imageRadius}px; overflow:hidden;`;
              imgWrapper.innerHTML = `<img src="${item.meta.image.url}" style="width:100%; height:100%; object-fit:cover;">`;
            }
            preview.appendChild(imgWrapper);
          }

          // Content
          const content = document.createElement('div');
          content.style.cssText = isColumn
            ? `padding:0 10px 10px 10px; width:100%;`
            : `padding:10px 12px 10px 0; flex-grow:1; min-width:0;`;

          content.innerHTML = `
                <div style="font-weight:700; font-size:${s.titleFontSize}px; color:${s.titleColor}; margin-bottom:4px; line-height:1.3;">${item.meta.title || item.link}</div>
                ${item.meta.description ? `<div style="font-size:${s.descFontSize}px; color:${s.descColor}; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; webkit-box-orient:vertical; overflow:hidden;">${item.meta.description}</div>` : ''}
             `;
          preview.appendChild(content);

          // Edit Button
          const editBtn = document.createElement('button');
          editBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
          editBtn.style.cssText = 'position:absolute; top:4px; right:4px; background:white; border:1px solid #e5e7eb; border-radius:4px; padding:3px; cursor:pointer; color:#6b7280; box-shadow:0 1px 2px rgba(0,0,0,0.05);';
          editBtn.onclick = (e) => { e.stopPropagation(); renderLPEdit(); };

          preview.appendChild(editBtn);
          lpContainer.appendChild(preview);
        };

        let activeTab = 'content';

        const renderLPEdit = () => {
          lpContainer.innerHTML = '';

          // Tabs
          const tabs = document.createElement('div');
          tabs.style.cssText = 'display:flex; gap:10px; margin-bottom:10px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;';

          const renderForm = () => {
            formContainer.innerHTML = '';
            if (activeTab === 'content') {
              formContainer.append(
                this.createInput('Title', 'text', item.meta.title || '', v => update('meta', { ...item.meta, title: v })),
                this.createInput('Desc', 'text', item.meta.description || '', v => update('meta', { ...item.meta, description: v })),
                this.createInput('Image', 'url', item.meta.image?.url || '', v => update('meta', { ...item.meta, image: { ...(item.meta.image || {}), url: v } }))
              );
            } else {
              // Style
              const layoutRow = document.createElement('div');
              layoutRow.append(this.createSelectInput('Layout', item.style?.display || 'row', [{ value: 'row', label: 'Row' }, { value: 'column', label: 'Column' }], v => update('style', { ...(item.style || {}), display: v })));
              formContainer.appendChild(layoutRow);

              const grid = document.createElement('div');
              grid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;';

              const s = item.style || {};
              const updateStyle = (k, v) => update('style', { ...s, [k]: v });

              grid.append(
                this.createColorInput('BG', s.backgroundColor, v => updateStyle('backgroundColor', v)),
                this.createColorInput('Border', s.borderColor, v => updateStyle('borderColor', v)),
                this.createRangeInput('B. Width', s.borderWidth, 'px', 0, 10, v => updateStyle('borderWidth', v)),
                this.createRangeInput('Radius', s.borderRadius, 'px', 0, 20, v => updateStyle('borderRadius', v)),
                this.createRangeInput('Pad', s.padding, 'px', 0, 30, v => updateStyle('padding', v)),
                this.createRangeInput('Img Rad', s.imageRadius, 'px', 0, 20, v => updateStyle('imageRadius', v)),
                this.createRangeInput('Title Sz', s.titleFontSize, 'px', 10, 30, v => updateStyle('titleFontSize', v)),
                this.createColorInput('Title', s.titleColor, v => updateStyle('titleColor', v)),
                this.createRangeInput('Desc Sz', s.descFontSize, 'px', 10, 24, v => updateStyle('descFontSize', v)),
                this.createColorInput('Desc', s.descColor, v => updateStyle('descColor', v))
              );
              formContainer.appendChild(grid);
            }
          };

          ['content', 'style'].forEach(t => {
            const btn = document.createElement('button');
            btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            btn.style.cssText = `border:none; background:none; cursor:pointer; font-size:12px; font-weight:600; color:${activeTab === t ? '#2563eb' : '#6b7280'};`;
            btn.type = 'button'; // Prevent form submission if any
            btn.onclick = (e) => {
              e.stopPropagation(); // Stop bubbling
              activeTab = t;
              renderLPEdit();
            };
            tabs.appendChild(btn);
          });

          const formContainer = document.createElement('div');
          formContainer.style.cssText = 'display:flex; flex-direction:column; gap:8px;';
          renderForm();

          const doneBtn = document.createElement('button');
          doneBtn.textContent = 'Done';
          doneBtn.type = 'button';
          doneBtn.style.cssText = 'margin-top:8px; padding:4px 12px; background:#2563eb; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px; align-self:flex-end;';
          doneBtn.onclick = (e) => { e.stopPropagation(); renderLP(); };

          lpContainer.append(tabs, formContainer, doneBtn);
        };

        renderLP();
        container.appendChild(lpContainer);
        break;

      case 'row':
        const rowControls = document.createElement('div');
        rowControls.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

        // Nested Column Selector
        const rowSelectorRow = document.createElement('div');
        rowSelectorRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;';

        const rsLabel = document.createElement('span');
        rsLabel.textContent = 'Nested Columns';
        rsLabel.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 500;';

        const rsSelect = document.createElement('select');
        rsSelect.style.cssText = 'padding: 4px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 4px;';
        [2, 3].forEach(n => {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          if (n === item.columns) opt.selected = true;
          rsSelect.appendChild(opt);
        });

        rsSelect.addEventListener('change', e => {
          const newCols = Number(e.target.value);
          update('columns', newCols);
          while (item.content.length < newCols) item.content.push([]);
          item.content = item.content.slice(0, newCols);
          renderNestedColumns();
        });

        rowSelectorRow.append(rsLabel, rsSelect);

        // Row Styling
        const rowStyle = document.createElement('div');
        rowStyle.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;';

        const rowBasicStyle = document.createElement('div');
        rowBasicStyle.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;';
        rowBasicStyle.append(
          this.createColorInput('Bg Color', item.backgroundColor || '#ffffff', v => update('backgroundColor', v)),
          this.createRangeInput('Pad Y', item.paddingY || '0', 'px', 0, 60, v => update('paddingY', v))
        );

        const rowMediaStyle = document.createElement('div');
        rowMediaStyle.style.cssText = 'display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px;';

        rowMediaStyle.append(
          this.createInput('Background Image URL', 'url', item.backgroundImage || '', v => {
            update('backgroundImage', v);
            if (v) update('backgroundColor', 'transparent'); // Reset color
          }),
          this.createInput('Background Video URL (mp4/webm)', 'url', item.backgroundVideo || '', v => {
            update('backgroundVideo', v);
            if (v) update('backgroundColor', 'transparent'); // Reset color
          })
        );

        const rowBgSettings = document.createElement('div');
        rowBgSettings.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;';
        rowBgSettings.append(
          this.createSelectInput('Bg Size', item.backgroundSize || 'cover', [
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'auto', label: 'Auto' }
          ], v => update('backgroundSize', v)),
          this.createSelectInput('Bg Position', item.backgroundPosition || 'center center', [
            { value: 'center center', label: 'Center' },
            { value: 'top center', label: 'Top' },
            { value: 'bottom center', label: 'Bottom' },
            { value: 'left center', label: 'Left' },
            { value: 'right center', label: 'Right' }
          ], v => update('backgroundPosition', v))
        );

        rowMediaStyle.appendChild(rowBgSettings);
        rowStyle.append(rowBasicStyle, rowMediaStyle);

        const nestedGrid = document.createElement('div');
        nestedGrid.style.cssText = `display: grid; gap: 10px; grid-template-columns: repeat(${item.columns}, minmax(0, 1fr)); ${item.backgroundImage ? `background-image: url('${item.backgroundImage}'); background-size: ${item.backgroundSize || 'cover'}; background-position: ${item.backgroundPosition || 'center'};` : ''} ${item.backgroundColor ? `background-color: ${item.backgroundColor};` : ''} padding: ${item.paddingY || 0}px 0;`;

        const renderNestedColumns = () => {
          nestedGrid.innerHTML = '';
          nestedGrid.style.gridTemplateColumns = `repeat(${item.columns}, minmax(0, 1fr))`;
          // Update preview styles
          nestedGrid.style.backgroundImage = item.backgroundImage ? `url('${item.backgroundImage}')` : 'none';
          nestedGrid.style.backgroundSize = item.backgroundSize || 'cover';
          nestedGrid.style.backgroundPosition = item.backgroundPosition || 'center';
          nestedGrid.style.backgroundColor = item.backgroundColor || 'transparent';
          nestedGrid.style.padding = `${item.paddingY || 0}px 0`;

          item.content.forEach((col, idx) => {
            this.renderColumn(idx, col, nestedGrid, true);
          });
        }

        rowControls.append(rowSelectorRow, rowStyle, nestedGrid);
        container.appendChild(rowControls);
        renderNestedColumns();
        break;

      case 'button':
        container.append(
          this.createInput('Label', 'text', item.label || 'Click me', v => update('label', v)),
          this.createInput('URL', 'url', item.url || 'https://', v => update('url', v))
        );
        // Colors
        const btnColors = document.createElement('div');
        btnColors.style.cssText = 'display: flex; gap: 8px;';
        btnColors.append(
          this.createColorInput('Background', item.bgColor || '#6366f1', v => update('bgColor', v)),
          this.createColorInput('Text', item.textColor || '#ffffff', v => update('textColor', v))
        );
        container.appendChild(btnColors);
        // Styling
        const btnStyles = document.createElement('div');
        btnStyles.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px;';
        btnStyles.append(
          this.createRangeInput('Pad X', item.paddingX || '20', 'px', 8, 48, v => update('paddingX', v)),
          this.createRangeInput('Pad Y', item.paddingY || '10', 'px', 6, 24, v => update('paddingY', v)),
          this.createRangeInput('Radius', item.borderRadius || '4', 'px', 0, 30, v => update('borderRadius', v)),
          this.createRangeInput('Text Size', item.fontSize || '14', 'px', 12, 24, v => update('fontSize', v)),
          this.createSelectInput('Align', item.align || 'center', [
            { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
          ], v => update('align', v)),
          this.createCheckboxInput('Full Width', item.fullWidth || false, v => update('fullWidth', v))
        );
        container.appendChild(btnStyles);
        break;

      case 'image':
        container.append(
          this.createInput('Image URL', 'url', item.url || '', v => update('url', v)),
          this.createInput('Alt text', 'text', item.alt || '', v => update('alt', v))
        );
        // Styling
        const imgStyles = document.createElement('div');
        imgStyles.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px;';
        imgStyles.append(
          this.createRangeInput('Width', item.width || '100', '%', 10, 100, v => update('width', v)),
          this.createRangeInput('Radius', item.borderRadius || '4', 'px', 0, 50, v => update('borderRadius', v)),
          this.createSelectInput('Shadow', item.shadow || 'none', [
            { value: 'none', label: 'None' }, { value: '0 2px 4px rgba(0,0,0,0.1)', label: 'Small' },
            { value: '0 4px 6px rgba(0,0,0,0.1)', label: 'Medium' }, { value: '0 10px 15px rgba(0,0,0,0.1)', label: 'Large' }
          ], v => update('shadow', v))
        );
        container.appendChild(imgStyles);
        break;

      case 'link':
        container.append(
          this.createInput('Text', 'text', item.text || 'Click here', v => update('text', v)),
          this.createInput('URL', 'url', item.url || 'https://', v => update('url', v))
        );
        break;
    }

    return container;
  }

  // --- Helper Methods ---

  createInput(label, type, value, onChange) {
    const wrapper = document.createElement('div');
    const labelEl = document.createElement('label');
    labelEl.style.cssText = 'display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
    labelEl.textContent = label;
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.style.cssText = 'width: 100%; padding: 6px 8px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-family: inherit;';
    input.addEventListener('input', e => onChange(e.target.value));
    wrapper.append(labelEl, input);
    return wrapper;
  }

  createRangeInput(label, value, unit, min, max, onChange) {
    const wrapper = document.createElement('div');
    const labelRow = document.createElement('div');
    labelRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;';

    const labelEl = document.createElement('span');
    labelEl.style.cssText = 'font-size: 10px; color: #64748b; font-weight: 500;';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = 'font-size: 10px; color: #6366f1; font-weight: 600;';
    valueEl.textContent = `${value}${unit} `;

    labelRow.append(labelEl, valueEl);

    const range = document.createElement('input');
    range.type = 'range';
    range.min = min;
    range.max = max;
    range.value = value;
    range.style.cssText = 'width: 100%; cursor: pointer; accent-color: #6366f1; height: 4px;';
    range.addEventListener('input', e => {
      valueEl.textContent = `${e.target.value}${unit} `;
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
    select.style.cssText = 'width: 100%; padding: 4px; font-size: 11px; border: 1px solid #e5e7eb; border-radius: 6px;';
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

  createCheckboxInput(label, checked, onChange) {
    const wrapper = document.createElement('label');
    wrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; cursor: pointer; padding-top: 14px;';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.style.cssText = 'accent-color: #6366f1; width: 14px; height: 14px;';
    input.addEventListener('change', e => onChange(e.target.checked));

    const span = document.createElement('span');
    span.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 500;';
    span.textContent = label;

    wrapper.append(input, span);
    return wrapper;
  }

  createColorInput(label, value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'flex: 1;';
    const labelEl = document.createElement('label');
    labelEl.style.cssText = 'display: block; font-size: 10px; color: #64748b; margin-bottom: 4px; font-weight: 500;';
    labelEl.textContent = label;
    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = 'display: flex; align-items: center; gap: 4px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 6px; background: white;';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = value;
    colorInput.style.cssText = 'width: 20px; height: 20px; border: none; padding: 0; cursor: pointer; border-radius: 4px;';
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = value;
    textInput.style.cssText = 'flex: 1; border: none; font-size: 11px; width: 50px; font-family: monospace;';

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

  showContentTypeMenu(button, onSelect) {
    document.querySelectorAll('.column-content-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'column-content-menu';
    menu.style.cssText = 'position: fixed; z-index: 1000; background: white; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 6px; min-width: 120px;';

    CONTENT_TYPES.forEach(type => {
      const item = document.createElement('button');
      item.type = 'button';
      item.style.cssText = 'width: 100%; padding: 8px 12px; text-align: left; font-size: 13px; color: #374151; background: none; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; text-transform: capitalize;';
      item.innerHTML = `${this.getTypeIcon(type)} ${type} `;
      item.onmouseenter = () => { item.style.background = '#f8fafc'; };
      item.onmouseleave = () => { item.style.background = 'none'; };
      item.addEventListener('click', () => {
        menu.remove();
        onSelect(type);
      });
      menu.appendChild(item);
    });

    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;

    document.body.appendChild(menu);

    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== button) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  getTypeIcon(type) {
    const icons = {
      text: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
      button: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/></svg>',
      image: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
      link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
      linkPreview: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>', // Placeholder icon, maybe similar to linkTool
      row: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'
    };
    return icons[type] || '';
  }

  getDefaultContent(type) {
    switch (type) {
      case 'text':
        return { type: 'text', value: '' };
      case 'row':
        return {
          type: 'row',
          columns: 2,
          content: [[], []],
          backgroundColor: '#ffffff',
          paddingY: '0'
        };
      case 'button':
        return {
          type: 'button',
          label: 'Click me',
          url: 'https://',
          bgColor: '#6366f1',
          textColor: '#ffffff',
          paddingX: '20',
          paddingY: '10',
          borderRadius: '4',
          fontSize: '14',
          align: 'left',
          fullWidth: false
        };
      case 'image':
        return {
          type: 'image',
          url: '',
          alt: '',
          width: '100',
          borderRadius: '4',
          shadow: 'none'
        };
      case 'link':
        return { type: 'link', text: 'Click here', url: 'https://', color: '#6366f1' };
      case 'linkPreview':
        return {
          type: 'linkPreview',
          link: '',
          meta: {},
          style: {
            display: 'row',
            backgroundColor: '#ffffff',
            borderColor: '#e1e3e6',
            borderRadius: '6',
            borderWidth: '1',
            padding: '0',
            titleColor: '#111827',
            titleFontSize: '14',
            descColor: '#6b7280',
            descFontSize: '12',
            imageRadius: '6'
          }
        };
      default:
        return { type: 'text', value: '' };
    }
  }

  save() {
    return this.data;
  }
}

