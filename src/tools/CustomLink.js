
export default class CustomLink {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            a: {
                href: true,
                target: true,
                style: true,
                class: true,
                rel: true
            }
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.state = false;
        this.tag = 'A';
        this.iconClasses = {
            base: this.api.styles.inlineToolButton,
            active: this.api.styles.inlineToolButtonActive
        };
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        this.button.classList.add(this.iconClasses.base);

        return this.button;
    }

    surround(range) {
        if (this.state) {
            this.unwrap(range);
            return;
        }

        this.wrap(range);
    }

    wrap(range) {
        const selectedText = range.extractContents();
        const link = document.createElement(this.tag);
        link.target = '_blank'; // default
        link.href = ''; // Placeholder
        // Default styling to make it visible it's a link
        link.style.textDecoration = 'underline';
        link.style.color = '#6366f1';

        link.appendChild(selectedText);
        range.insertNode(link);

        this.api.selection.expandToTag(link);
    }

    unwrap(range) {
        const link = this.api.selection.findParentTag(this.tag);
        this.api.selection.expandToTag(link);
        const selection = window.getSelection();
        const range2 = selection.getRangeAt(0);

        const text = range2.extractContents();
        link.parentNode.insertBefore(text, link);
        link.remove();
    }

    checkState(selection) {
        const link = this.api.selection.findParentTag(this.tag);
        this.state = !!link;

        if (this.state) {
            this.button.classList.add(this.iconClasses.active);
            this.api.tooltip.show(link.href);
        } else {
            this.button.classList.remove(this.iconClasses.active);
            this.api.tooltip.hide();
        }

        return this.state;
    }

    renderActions() {
        const link = this.api.selection.findParentTag(this.tag);
        // If no link is selected, actions shouldn't really show if checking state correctly, but good to handle
        if (!link) return document.createElement('div');

        this.actions = document.createElement('div');
        this.actions.style.cssText = 'padding: 10px; display: flex; flex-direction: column; gap: 8px; width: 260px; background: white; border-radius: 6px;';

        // URL Input
        const urlInput = document.createElement('input');
        urlInput.placeholder = 'https://...';
        urlInput.value = link.href;
        urlInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; outline: none; margin-bottom: 4px;';
        urlInput.addEventListener('input', (e) => {
            link.href = e.target.value;
        });

        // Options Row
        const optionsRow = document.createElement('div');
        optionsRow.style.cssText = 'display: flex; gap: 12px; align-items: center; justify-content: space-between;';

        // Color Picker Container
        const colorContainer = document.createElement('div');
        colorContainer.style.cssText = 'display: flex; items-center; gap: 6px;';

        const colorLabel = document.createElement('span');
        colorLabel.textContent = 'Color';
        colorLabel.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 500;';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.title = 'Link Color';
        // Helper to get hex from rbg or style
        const currentColor = link.style.color || '#6366f1';
        colorInput.value = this.rgbToHex(currentColor) || '#6366f1';
        colorInput.style.cssText = 'width: 24px; height: 24px; border: none; padding: 0; cursor: pointer; border-radius: 4px; overflow: hidden;';
        colorInput.addEventListener('input', (e) => {
            link.style.color = e.target.value;
            // Also force text decoration underline color match or override
            link.style.textDecorationColor = e.target.value;
        });

        colorContainer.append(colorLabel, colorInput);

        // Style Toggles
        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText = 'display: flex; gap: 4px;';

        // Bold Toggle
        const boldBtn = document.createElement('button');
        boldBtn.innerHTML = '<b>B</b>';
        boldBtn.type = 'button';
        const isBold = link.style.fontWeight === 'bold' || link.style.fontWeight === '700';
        boldBtn.style.cssText = `width: 28px; height: 28px; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s; background: ${isBold ? '#eff6ff' : 'white'}; color: ${isBold ? '#3b82f6' : '#64748b'}; border-color: ${isBold ? '#bfdbfe' : '#e2e8f0'};`;

        boldBtn.onclick = () => {
            const isNowBold = link.style.fontWeight === 'bold' || link.style.fontWeight === '700';
            link.style.fontWeight = isNowBold ? 'normal' : 'bold';

            // Update button style
            const active = !isNowBold;
            boldBtn.style.background = active ? '#eff6ff' : 'white';
            boldBtn.style.color = active ? '#3b82f6' : '#64748b';
            boldBtn.style.borderColor = active ? '#bfdbfe' : '#e2e8f0';
        }

        // New Tab Toggle (Icon)
        const targetWrapper = document.createElement('div');
        targetWrapper.style.cssText = 'display: flex; align-items: center; gap: 4px; margin-left: 8px; border-left: 1px solid #f1f5f9; padding-left: 8px;';

        const targetLabel = document.createElement('label');
        targetLabel.style.cssText = 'font-size: 11px; color: #64748b; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px;';
        const targetCheck = document.createElement('input');
        targetCheck.type = 'checkbox';
        targetCheck.checked = link.target === '_blank';
        targetCheck.style.cssText = 'cursor: pointer;';
        targetCheck.onchange = (e) => {
            link.target = e.target.checked ? '_blank' : '_self';
        };
        targetLabel.append(targetCheck, document.createTextNode('New Tab'));
        targetWrapper.append(targetLabel);

        toggleContainer.append(boldBtn);

        optionsRow.append(colorContainer, toggleContainer, targetWrapper);
        this.actions.append(urlInput, optionsRow);

        return this.actions;
    }

    rgbToHex(col) {
        if (!col) return null;
        if (col.charAt(0) == '#') return col;
        const rgb = col.match(/\d+/g);
        if (!rgb) return null;
        return "#" + ((1 << 24) + (+rgb[0] << 16) + (+rgb[1] << 8) + +rgb[2]).toString(16).slice(1);
    }
}
