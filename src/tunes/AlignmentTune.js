const OPTIONS = [
  { value: 'left', label: 'L' },
  { value: 'center', label: 'C' },
  { value: 'right', label: 'R' },
];

export default class AlignmentTune {
  static get isTune() {
    return true;
  }

  constructor({ api, data }) {
    this.api = api;
    this.data = data || { alignment: 'left' };
    this.buttons = [];
    this.blockContent = null;
  }

  wrap(blockContent) {
    this.blockContent = blockContent;
    if (blockContent && blockContent.style) {
      blockContent.style.textAlign = this.data.alignment || 'left';
    }
    return blockContent;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('cdx-settings');
    this.buttons = OPTIONS.map(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add(this.api.styles.settingsButton);
      if (this.data.alignment === option.value) {
        button.classList.add(this.api.styles.settingsButtonActive);
      }
      button.textContent = option.label;
      button.addEventListener('click', () => {
        this.data.alignment = option.value;
        this.buttons.forEach(btn => btn.classList.remove(this.api.styles.settingsButtonActive));
        button.classList.add(this.api.styles.settingsButtonActive);
        if (this.blockContent && this.blockContent.style) {
          this.blockContent.style.textAlign = this.data.alignment;
        }
      });
      wrapper.appendChild(button);
      return button;
    });
    return wrapper;
  }

  save() {
    return this.data;
  }
}
