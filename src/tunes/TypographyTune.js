import { ALL_FONTS } from '../constants/googleFonts';

export default class TypographyTune {
    static get isTune() {
        return true;
    }

    constructor({ api, data, config }) {
        this.api = api;
        // Merge defaults with passed data to ensure all properties exist
        this.data = {
            fontSize: '',
            fontFamily: '',
            color: '',
            ...(data || {})
        };
        this.config = config || {};
        this.blockContent = null;
    }

    wrap(blockContent) {
        this.blockContent = blockContent;
        this.applyStyles();
        return blockContent;
    }

    applyStyles() {
        if (!this.blockContent) return;

        const setStyle = (el, prop, val) => {
            if (val) {
                el.style.setProperty(prop, val, 'important');
            } else {
                el.style.removeProperty(prop);
            }
        };

        const cssProps = {
            'font-size': this.data.fontSize,
            'font-family': this.data.fontFamily,
            'color': this.data.color
        };

        // Apply to wrapper
        Object.entries(cssProps).forEach(([prop, val]) => setStyle(this.blockContent, prop, val));

        // Apply to deep children
        const children = this.blockContent.querySelectorAll('*');
        children.forEach(child => {
            Object.entries(cssProps).forEach(([prop, val]) => setStyle(child, prop, val));
        });

        // Trigger change
        this.blockContent.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { fromTune: true } }));

        // Manual trigger if configured (for instant preview update)
        if (this.config.onTuneChange) {
            this.config.onTuneChange();
        }
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('cdx-settings');
        wrapper.style.display = 'flex';
        wrapper.style.flexWrap = 'wrap';
        wrapper.style.gap = '8px';
        wrapper.style.padding = '10px';

        // Font Size Select
        const sizeSelect = document.createElement('select');
        sizeSelect.style.padding = '4px';
        sizeSelect.style.borderRadius = '4px';
        sizeSelect.style.border = '1px solid #ddd';
        sizeSelect.style.fontSize = '12px';
        sizeSelect.style.flex = '1';
        sizeSelect.style.minWidth = '80px';
        sizeSelect.title = 'Font Size';

        const sizes = ['Default', '12px', '14px', '15px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];
        sizes.forEach(size => {
            const opt = document.createElement('option');
            opt.value = size === 'Default' ? '' : size;
            opt.text = size;
            if (this.data.fontSize === opt.value) opt.selected = true;
            sizeSelect.appendChild(opt);
        });

        sizeSelect.addEventListener('change', (e) => {
            this.data.fontSize = e.target.value;
            this.applyStyles();
        });

        // Font Family Select
        const familySelect = document.createElement('select');
        familySelect.style.padding = '4px';
        familySelect.style.borderRadius = '4px';
        familySelect.style.border = '1px solid #ddd';
        familySelect.style.fontSize = '12px';
        familySelect.style.flex = '1';
        familySelect.style.minWidth = '120px';
        familySelect.title = 'Font Family';

        ALL_FONTS.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.val;
            opt.text = f.name;
            if (this.data.fontFamily === f.val) opt.selected = true;
            // Mark Google Fonts visually (optional, but helpful)
            // if (!f.val.includes('Arial') && !f.val.includes('Verdana') && /* ... */) { ... }
            familySelect.appendChild(opt);
        });

        familySelect.addEventListener('change', (e) => {
            this.data.fontFamily = e.target.value;
            this.loadFontIfNeeded(e.target.selectedOptions[0].text); // Pass the font NAME, not value
            this.applyStyles();
        });

        // Color Input
        const colorWrapper = document.createElement('div');
        colorWrapper.style.display = 'flex';
        colorWrapper.style.alignItems = 'center';
        colorWrapper.style.gap = '8px';
        colorWrapper.style.flex = '1';
        colorWrapper.style.minWidth = '100%';

        const colorLabel = document.createElement('span');
        colorLabel.textContent = 'Color:';
        colorLabel.style.fontSize = '12px';
        colorLabel.style.color = '#707684';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = this.data.color || '#000000';
        colorInput.style.border = 'none';
        colorInput.style.padding = '0';
        colorInput.style.width = '24px';
        colorInput.style.height = '24px';
        colorInput.style.cursor = 'pointer';
        colorInput.style.backgroundColor = 'transparent';

        colorInput.addEventListener('input', (e) => {
            this.data.color = e.target.value;
            this.applyStyles();
        });

        colorWrapper.appendChild(colorLabel);
        colorWrapper.appendChild(colorInput);

        wrapper.appendChild(sizeSelect);
        wrapper.appendChild(familySelect);
        wrapper.appendChild(colorWrapper);

        return wrapper;
    }

    /**
     * Dynamically inject Google Fonts stylesheet if not present
     */
    loadFontIfNeeded(fontName) {
        if (!fontName || fontName === 'Default') return;

        // Check if it's a known Google Font by checking our list
        const fontObj = ALL_FONTS.find(f => f.name === fontName);
        if (!fontObj) return;

        // Check against web-safe fonts to avoid unnecessary requests
        const isWebSafe = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New', 'Impact', 'Comic Sans'].includes(fontName);
        if (isWebSafe) return;

        const id = `google-font-${fontName.replace(/\s+/g, '-')}`;
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }

    save() {
        return this.data;
    }
}
