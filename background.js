const STORAGE_KEY = 'enabled';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([STORAGE_KEY], (res) => {
    if (typeof res[STORAGE_KEY] !== 'boolean') {
      chrome.storage.local.set({ [STORAGE_KEY]: true });
    }
  });
});

function buildInjectionCode(enabled) {
  const value = enabled ? 'dark' : 'custom-winter';
  return `(() => {
    const DESIRED = ${JSON.stringify(value)};
    const KEY = 'theme';
    const setDesired = () => {
      try {
        const prev = localStorage.getItem(KEY);
        if (prev !== DESIRED) {
          localStorage.setItem(KEY, DESIRED);
          window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: DESIRED, oldValue: prev, storageArea: localStorage }));
          document.dispatchEvent(new CustomEvent('theme-override', { detail: { theme: DESIRED, oldValue: prev } }));
        }
      } catch (e) { }
    };

    setDesired();

    try {
      const _set = Storage.prototype.setItem;
      const _remove = Storage.prototype.removeItem;
      Storage.prototype.setItem = function(k, v) {
        if (this === localStorage && String(k) === KEY && v !== DESIRED) {
          const ret = _set.call(this, KEY, DESIRED);
          setTimeout(setDesired, 0);
          return ret;
        }
        return _set.call(this, k, v);
      };
      Storage.prototype.removeItem = function(k) {
        if (this === localStorage && String(k) === KEY) {
          const ret = _set.call(this, KEY, DESIRED);
          setTimeout(setDesired, 0);
          return ret;
        }
        return _remove.call(this, k);
      };
    } catch (e) { }

    let count = 0;
    const id = setInterval(() => {
      setDesired();
      if (++count > 20) clearInterval(id);
    }, 50);
  })();`;
}

async function applyToTab(tabId) {
  if (!tabId) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.id || !tab.url) return;
    if (/^(chrome|edge|about|chrome-extension):/i.test(tab.url)) return;

    const { enabled } = await chrome.storage.local.get({ enabled: true });
    const desired = enabled ? 'dark' : 'custom-winter';
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      world: 'MAIN',
      files: ['injected/main-world.js']
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      world: 'ISOLATED',
      func: (val) => { document.documentElement.setAttribute('data-theme-override-desired', val); },
      args: [desired]
    });
  } catch (e) {
    
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'SET_ENABLED') {
    chrome.storage.local.set({ [STORAGE_KEY]: !!msg.enabled }, async () => {
      let targetTabId = sender?.tab?.id;
      if (!targetTabId) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        targetTabId = activeTab?.id;
      }
      if (targetTabId) await applyToTab(targetTabId);
      try {
        if (targetTabId) await chrome.tabs.sendMessage(targetTabId, { type: 'SHOW_REOPEN_MODAL', enabled: !!msg.enabled });
      } catch (_) { }
      sendResponse({ ok: true });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'complete') {
    applyToTab(tabId);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  applyToTab(tabId);
});

