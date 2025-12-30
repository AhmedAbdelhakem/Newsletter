export default class SpacerBlock {
  static get toolbox() {
    return {
      title: 'Spacer',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 18h8M10 6h4"/><path d="M12 22V2"/></svg>'
    };
  }

  constructor({ data, api }) {
    this.data = { height: data?.height || 32 };
    this.api = api;
    this.wrapper = null;
  }

  // Dispatch change for real-time preview updates
  dispatchChange() {
    this.wrapper?.dispatchEvent(new CustomEvent('input', { bubbles: true }));
  }

  render() {
    const wrapper = document.createElement('div');
    this.wrapper = wrapper;
    wrapper.className = 'space-y-2';

    const label = document.createElement('label');
    label.className = 'block text-sm text-slate-600';
    label.textContent = `Height: ${this.data.height}px`;

    const range = document.createElement('input');
    range.type = 'range';
    range.min = 8;
    range.max = 96;
    range.value = this.data.height;
    range.className = 'w-full';
    range.addEventListener('input', event => {
      this.data.height = Number(event.target.value);
      label.textContent = `Height: ${this.data.height}px`;
      preview.style.height = `${this.data.height}px`;
      this.dispatchChange();
    });

    const preview = document.createElement('div');
    preview.className = 'bg-slate-200 rounded';
    preview.style.height = `${this.data.height}px`;

    wrapper.append(label, range, preview);
    return wrapper;
  }

  save() {
    return this.data;
  }
}
