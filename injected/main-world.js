(function() {
  const KEY = 'theme';
  const getDesired = () => document.documentElement.getAttribute('data-theme-override-desired') || 'dark';
  const DESIRED = getDesired();

  const setDesired = () => {
    try {
      const prev = localStorage.getItem(KEY);
      const target = getDesired();
      if (prev !== target) {
        localStorage.setItem(KEY, target);
        try { window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: target, oldValue: prev, storageArea: localStorage })); } catch (_) {}
        try { document.dispatchEvent(new CustomEvent('theme-override', { detail: { theme: target, oldValue: prev } })); } catch (_) {}
      }
    } catch (_) {}
  };

  setDesired();

  try {
    const _set = Storage.prototype.setItem;
    const _remove = Storage.prototype.removeItem;
    Storage.prototype.setItem = function(k, v) {
      if (this === localStorage && String(k) === KEY && v !== getDesired()) {
        const ret = _set.call(this, KEY, getDesired());
        setTimeout(setDesired, 0);
        return ret;
      }
      return _set.call(this, k, v);
    };
    Storage.prototype.removeItem = function(k) {
      if (this === localStorage && String(k) === KEY) {
        const ret = _set.call(this, KEY, getDesired());
        setTimeout(setDesired, 0);
        return ret;
      }
      return _remove.call(this, k);
    };
  } catch (_) {}

  let count = 0;
  const id = setInterval(() => {
    setDesired();
    if (++count > 20) clearInterval(id);
  }, 50);
})();
