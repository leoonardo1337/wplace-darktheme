(async () => {
  try {
    const { enabled = true } = await chrome.storage.local.get({ enabled: true });
    const desired = enabled ? 'dark' : 'custom-winter';
    document.documentElement.setAttribute('data-theme-override-desired', desired);
  } catch (_) { }
})();
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.type !== 'SHOW_REOPEN_MODAL') return;
  showReopenModal(msg.enabled);
});

function showReopenModal(enabled) {
  if (document.getElementById('theme-override-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'theme-override-modal';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '2147483647';
  overlay.style.display = 'grid';
  overlay.style.placeItems = 'center';
  overlay.style.backdropFilter = 'blur(3px)';
  overlay.style.background = 'rgba(0,0,0,0.45)';

  const box = document.createElement('div');
  box.style.maxWidth = '520px';
  box.style.margin = '24px';
  box.style.padding = '20px 18px';
  box.style.borderRadius = '12px';
  box.style.background = '#121212';
  box.style.color = '#f5f5f5';
  box.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  box.style.boxShadow = '0 10px 30px rgba(0,0,0,.45)';

  const title = document.createElement('h2');
  title.textContent = chrome.i18n.getMessage('modalTitle') || 'WPlace Dark Theme';
  title.style.margin = '0 0 8px';
  title.style.fontSize = '18px';

  const p = document.createElement('p');
  p.style.margin = '0 0 10px';
  p.style.lineHeight = '1.5';
  const bodyOn = chrome.i18n.getMessage('modalBodyOn') || 'Theme set to <b>dark</b>.<br>Close this tab and open the site in a <b>new tab</b>.';
  const bodyOff = chrome.i18n.getMessage('modalBodyOff') || 'Theme reverted to the <b>default</b>.<br>Close this tab and open the site in a <b>new tab</b>.';
  p.innerHTML = enabled ? bodyOn : bodyOff;

  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '10px';
  buttons.style.marginTop = '8px';

  const btnClose = document.createElement('button');
  btnClose.textContent = chrome.i18n.getMessage('btnUnderstood') || 'Got it';
  Object.assign(btnClose.style, { padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1e88e5', color: '#fff', fontWeight: '600' });
  btnClose.onclick = () => overlay.remove();

  const btnOpen = document.createElement('button');
  btnOpen.textContent = chrome.i18n.getMessage('btnOpenNewTab') || 'Open in new tab';
  Object.assign(btnOpen.style, { padding: '8px 12px', borderRadius: '8px', border: '1px solid #3a3a3a', cursor: 'pointer', background: '#232323', color: '#fff' });
  btnOpen.onclick = () => {
    try { window.open(location.href, '_blank'); } catch (_) {}
  };

  buttons.appendChild(btnClose);
  buttons.appendChild(btnOpen);
  box.appendChild(title);
  box.appendChild(p);
  box.appendChild(buttons);
  overlay.appendChild(box);
  document.documentElement.appendChild(overlay);
}

