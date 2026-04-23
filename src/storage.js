// localStorage-backed shim that matches the window.storage API used in
// ShiftTracker (get/set/delete returning { value: string } | null).

const PREFIX = 'shift:';

function makeStorage() {
  return {
    async get(key) {
      try {
        const v = window.localStorage.getItem(PREFIX + key);
        return v === null ? null : { value: v };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      window.localStorage.setItem(PREFIX + key, value);
    },
    async delete(key) {
      window.localStorage.removeItem(PREFIX + key);
    },
  };
}

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = makeStorage();
}
