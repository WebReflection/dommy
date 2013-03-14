var WeakShim = window.WeakMap || function WeakShim(){
  var
    keys = [],
    values = [],
    i
  ;
  function get(key) {
    return values[keys.indexOf(key)];
  }
  function has(key) {
    return -1 < (i = keys.indexOf(key));
  }
  function set(key, value) {
    values[has(key) ? i : keys.push(key) - 1] = value;
  }
  function del(key) {
    if (has(key)) keys.splice(i, 1), values.splice(i, 1);
  }
  return {
    get: get,
    has: has,
    set: set,
    "delete": del
  };
};
