export default class LinkToolBlock {
    static get toolbox() {
        return {
            title: 'Link Preview',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4285 13.9113C16.892 12.4478 16.892 10.0754 15.4285 8.61191L13.883 7.06646C12.4195 5.60295 10.0471 5.60295 8.58359 7.06646L7.94273 7.70732" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.57155 10.0887C7.10804 11.5522 7.10804 13.9246 8.57155 15.3881L10.1171 16.9336C11.5805 18.3971 13.9529 18.3971 15.4164 16.9336L16.0573 16.2927" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
    }

    constructor({ data, api }) {
        this.data = {
            link: data.link || '',
            meta: data.meta || {},
            style: data.style || {
                display: 'row',
                backgroundColor: '#ffffff',
                borderColor: '#e1e3e6',
                borderRadius: '6',
                borderWidth: '1',
                padding: '0',
                titleColor: '#111827',
                titleFontSize: '16',
                descColor: '#6b7280',
                descFontSize: '14',
                imageRadius: '6'
            }
        };
        this.api = api;
        this.wrapper = undefined;
        this.activeTab = 'content'; // 'content' or 'style'
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('cdx-link-tool');

        if (this.data.link && this.data.meta.title) {
            this._showPreview(this.data);
        } else {
            this._showInput();
        }

        return this.wrapper;
    }

    save(blockContent) {
        return this.data;
    }

    validate(savedData) {
        if (!savedData.link) {
            return false;
        }
        return true;
    }

    _showInput() {
        this.wrapper.innerHTML = '';

        const input = document.createElement('input');
        input.classList.add('cdx-input');
        input.placeholder = 'Paste link URL...';
        input.value = this.data.link;
        input.style.width = '100%';
        input.style.border = '1px solid #e1e3e6';
        input.style.borderRadius = '3px';
        input.style.padding = '10px 12px';
        input.style.fontSize = '14px';

        input.addEventListener('paste', async (event) => {
            const url = (event.clipboardData || window.clipboardData).getData('text');
            this.data.link = url;
            await this._fetchMetadata(url);
        });

        input.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const url = input.value;
                this.data.link = url;
                await this._fetchMetadata(url);
            }
        });

        this.wrapper.appendChild(input);
    }

    async _fetchMetadata(url) {
        this.wrapper.innerHTML = '<div class="cdx-loader">Fetching...</div>';

        try {
            const response = await fetch(`http://localhost:3001/api/fetch-url-metadata?url=${encodeURIComponent(url)}`);
            const result = await response.json();

            if (result.success) {
                // Keep existing style if present
                this.data = {
                    ...result,
                    style: this.data.style
                };
                this._showPreview(this.data);
            } else {
                console.error('Link fetch failed', result);
                this._showInput();
                const input = this.wrapper.querySelector('input');
                if (input) input.value = url;
            }
        } catch (e) {
            console.error('Link fetch error', e);
            this._showInput();
        }
    }

    _showEditForm() {
        this.wrapper.innerHTML = '';
        this.wrapper.style.padding = '16px';
        this.wrapper.style.border = '1px solid #e1e3e6';
        this.wrapper.style.borderRadius = '6px';
        this.wrapper.style.background = '#f9fafb';

        // Tabs
        const tabs = document.createElement('div');
        tabs.style.display = 'flex';
        tabs.style.gap = '12px';
        tabs.style.marginBottom = '16px';
        tabs.style.borderBottom = '1px solid #e5e7eb';
        tabs.style.paddingBottom = '8px';

        const createTab = (id, label) => {
            const tab = document.createElement('button');
            tab.textContent = label;
            tab.style.border = 'none';
            tab.style.background = 'none';
            tab.style.fontWeight = this.activeTab === id ? '600' : '400';
            tab.style.color = this.activeTab === id ? '#2563eb' : '#6b7280';
            tab.style.cursor = 'pointer';
            tab.onclick = () => {
                this.activeTab = id;
                this._showEditForm();
            };
            return tab;
        };

        tabs.append(createTab('content', 'Content'), createTab('style', 'Style'));
        this.wrapper.appendChild(tabs);

        if (this.activeTab === 'content') {
            const createInput = (label, value, key, isArea = false) => {
                const div = document.createElement('div');
                div.style.marginBottom = '12px';

                const labelEl = document.createElement('label');
                labelEl.textContent = label;
                labelEl.style.display = 'block';
                labelEl.style.fontSize = '12px';
                labelEl.style.fontWeight = '500';
                labelEl.style.marginBottom = '4px';
                labelEl.style.color = '#374151';

                const input = document.createElement(isArea ? 'textarea' : 'input');
                input.value = value || '';
                input.style.width = '100%';
                input.style.padding = '8px';
                input.style.fontSize = '14px';
                input.style.border = '1px solid #d1d5db';
                input.style.borderRadius = '4px';

                input.addEventListener('input', (e) => {
                    if (key === 'url') {
                        if (!this.data.meta.image) this.data.meta.image = {};
                        this.data.meta.image.url = e.target.value;
                    } else {
                        this.data.meta[key] = e.target.value;
                    }
                });
                div.append(labelEl, input);
                return div;
            };

            this.wrapper.append(
                createInput('Title', this.data.meta.title, 'title'),
                createInput('Description', this.data.meta.description, 'description', true),
                createInput('Image URL', this.data.meta.image?.url, 'url')
            );

        } else {
            // Style Tab
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = '1fr 1fr';
            grid.style.gap = '10px';

            // Layout Select
            const layoutDiv = document.createElement('div');
            layoutDiv.style.marginBottom = '10px';
            layoutDiv.style.gridColumn = 'span 2';
            const layoutLabel = document.createElement('label');
            layoutLabel.textContent = 'Layout';
            layoutLabel.style.fontSize = '11px';
            layoutLabel.style.color = '#6b7280';
            layoutLabel.style.display = 'block';
            layoutLabel.style.marginBottom = '2px';
            const layoutSelect = document.createElement('select');
            layoutSelect.style.width = '100%';
            layoutSelect.style.padding = '6px';
            layoutSelect.style.border = '1px solid #e5e7eb';
            layoutSelect.style.borderRadius = '4px';
            ['row', 'column'].forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
                option.selected = this.data.style.display === opt;
                layoutSelect.appendChild(option);
            });
            layoutSelect.onchange = (e) => this.data.style.display = e.target.value;
            layoutDiv.append(layoutLabel, layoutSelect);
            grid.append(layoutDiv);

            const createStyleInput = (label, key, type = 'text', suffix = '') => {
                const div = document.createElement('div');
                div.style.marginBottom = '10px';

                const labelEl = document.createElement('label');
                labelEl.textContent = label;
                labelEl.style.fontSize = '11px';
                labelEl.style.color = '#6b7280';
                labelEl.style.display = 'block';
                labelEl.style.marginBottom = '2px';

                const input = document.createElement('input');
                input.type = type;
                input.value = this.data.style[key];
                input.style.width = '100%';
                input.style.padding = '6px';
                input.style.border = '1px solid #e5e7eb';
                input.style.borderRadius = '4px';

                input.addEventListener('input', (e) => {
                    this.data.style[key] = e.target.value;
                });

                div.append(labelEl, input);
                return div;
            };

            grid.append(
                createStyleInput('BG Color', 'backgroundColor', 'color'),
                createStyleInput('Border Color', 'borderColor', 'color'),
                createStyleInput('Border Width (px)', 'borderWidth', 'number'),
                createStyleInput('Border Radius (px)', 'borderRadius', 'number'),
                createStyleInput('Padding (px)', 'padding', 'number'),
                createStyleInput('Image Radius (px)', 'imageRadius', 'number'),
                createStyleInput('Title Size (px)', 'titleFontSize', 'number'),
                createStyleInput('Title Color', 'titleColor', 'color'),
                createStyleInput('Desc Size (px)', 'descFontSize', 'number'),
                createStyleInput('Desc Color', 'descColor', 'color')
            );
            this.wrapper.append(grid);
        }

        // Actions
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.marginTop = '16px';
        actions.style.borderTop = '1px solid #e5e7eb';
        actions.style.paddingTop = '12px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Done';
        saveBtn.style.padding = '6px 16px';
        saveBtn.style.background = '#2563eb';
        saveBtn.style.color = 'white';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '13px';

        saveBtn.onclick = () => {
            this._showPreview(this.data);
        };

        actions.append(saveBtn);
        this.wrapper.append(actions);
    }

    _showPreview(data) {
        this.wrapper.innerHTML = '';
        this.wrapper.style.position = 'relative';

        const s = data.style;
        const isColumn = s.display === 'column';

        const preview = document.createElement('div');
        preview.style.border = `${s.borderWidth}px solid ${s.borderColor}`;
        preview.style.borderRadius = `${s.borderRadius}px`;
        preview.style.background = s.backgroundColor;
        preview.style.padding = `${s.padding}px`;
        preview.style.overflow = 'hidden';
        preview.style.display = 'flex';
        preview.style.flexDirection = isColumn ? 'column' : 'row';
        preview.style.marginTop = '10px';
        preview.style.alignItems = isColumn ? 'flex-start' : 'center'; // Align items vertically

        // Make preview container relative for absolute positioning of edit button
        const container = document.createElement('div');
        container.style.position = 'relative';

        // Image
        let imageContainer = '';
        if (data.meta.image && data.meta.image.url) {
            const imgStyle = isColumn
                ? `width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover; border-radius: ${s.imageRadius}px; display: block;`
                : `width: 100%; height: 100%; object-fit: cover;`;

            const wrapperStyle = isColumn
                ? `width: 100%; margin-bottom: 12px;`
                : `width: 80px; height: 80px; flex-shrink: 0; background: #f4f5f7; margin: 12px; border-radius: ${s.imageRadius}px; overflow: hidden;`;

            imageContainer = `
            <div style="${wrapperStyle}">
                <img src="${data.meta.image.url}" style="${imgStyle}" alt="">
            </div>
        `;
        }

        // Content
        const contentStyle = isColumn
            ? `padding: 0 12px 12px 12px; width: 100%;`
            : `padding: 12px 16px 12px 0; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;`;

        const content = `
        <div style="${contentStyle}">
            <a href="${data.link}" target="_blank" style="text-decoration: none; display: block;">
                <div style="font-weight: 700; font-size: ${s.titleFontSize}px; color: ${s.titleColor}; margin-bottom: 4px; line-height: 1.4;">
                    ${data.meta.title || data.link}
                </div>
                ${data.meta.description ? `
                <div style="font-size: ${s.descFontSize}px; color: ${s.descColor}; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${data.meta.description}
                </div>` : ''}
            </a>
        </div>
    `;

        preview.innerHTML = imageContainer + content;

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
        editBtn.style.position = 'absolute';
        editBtn.style.top = '8px';
        editBtn.style.right = '8px';
        editBtn.style.background = 'white';
        editBtn.style.border = '1px solid #e5e7eb';
        editBtn.style.borderRadius = '4px';
        editBtn.style.padding = '4px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.color = '#6b7280';
        editBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        editBtn.title = 'Edit';

        editBtn.onclick = (e) => {
            e.stopPropagation();
            this._showEditForm();
        };

        container.appendChild(preview);
        container.appendChild(editBtn);

        this.wrapper.appendChild(container);
    }
}
