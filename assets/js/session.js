window.FAST = window.FAST || {};
FAST.KEY = 'fast.spk.00418';
FAST.load = function () {
  try { return JSON.parse(localStorage.getItem(FAST.KEY) || 'null'); }
  catch (e) { return null; }
};
FAST.save = function (data) {
  var next = Object.assign({ spk: 'SPK/26/CLD/00418', ts: Date.now() }, FAST.load() || {}, data);
  localStorage.setItem(FAST.KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('fast-session', { detail: next }));
  return next;
};
