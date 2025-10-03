const STORAGE_KEY = 'enabled';

const toggle = document.getElementById('toggle');
const stateEl = document.getElementById('state');
const titleEl = document.getElementById('title');
const labelStateEl = document.getElementById('label-state');

function t(key, ...args) { return chrome.i18n.getMessage(key, args); }

function updateStateText(enabled) {
  stateEl.textContent = enabled ? t('popupOn') : t('popupOff');
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function apply(enabled) {
  // Save and notify background to apply on current tab
  await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
  const tab = await getCurrentTab();
  await chrome.runtime.sendMessage({ type: 'SET_ENABLED', enabled, tabId: tab?.id });
}

titleEl.textContent = t('appName') || 'WPlace Dark Theme';
labelStateEl.textContent = t('popupState');

chrome.storage.local.get({ [STORAGE_KEY]: true }, (res) => {
  const enabled = !!res[STORAGE_KEY];
  toggle.checked = enabled;
  updateStateText(enabled);
});

toggle.addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  updateStateText(enabled);
  await apply(enabled);
});
