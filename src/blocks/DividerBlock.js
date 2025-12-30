export default class DividerBlock {
  static get toolbox() {
    return {
      title: 'Divider',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/></svg>'
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.style.padding = '16px 0';
    const hr = document.createElement('hr');
    hr.className = 'border-t border-slate-200';
    wrapper.appendChild(hr);
    return wrapper;
  }

  save() {
    return {};
  }
}
