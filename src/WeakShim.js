var WeakShim = window.WeakMap || function WeakShim(){
  var
    keys = [],
    values = [],
    ws = {
      get: function (key) {
        return values[keys.indexOf(key)];
      },
      has: function (key) {
        return -1 < (i = keys.indexOf(key));
      },
      set: function (key, value) {
        values[ws.has(key) ? i : keys.push(key) - 1] = value;
      },
      "delete": function (key) {
        if (ws.has(key)) keys.splice(i, 1), values.splice(i, 1);
      }
    },
    i;
  return ws;
};
