window.FAST = window.FAST || {};
FAST.KEY = 'fast.spk.00418';
FAST.AFI_KEY = 'fast.spk.00418.afi';
FAST.DEL_KEY = 'fast.spk.00425';
FAST.GI_KEY = 'fast.spk.00424';
FAST.load = function (key) {
  try { return JSON.parse(localStorage.getItem(key || FAST.KEY) || 'null'); }
  catch (e) { return null; }
};
FAST.save = function (data, key) {
  var k = key || FAST.KEY;
  var next = Object.assign({ ts: Date.now() }, FAST.load(k) || {}, data);
  localStorage.setItem(k, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('fast-session', { detail: next }));
  return next;
};
