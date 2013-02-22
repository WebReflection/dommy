var WeakShim = window.WeakMap || function WeakShim(){
  var indexOf = "indexOf", keys = [], values = [], i;
  return {
    get: function (key) {
      return values[keys[indexOf](key)];
    },
    set: function (key, value) {
      values[~(i = keys[indexOf](key)) ? i : keys.push(key) - 1] = value;
    },
    "delete": function (key) {
      if (~(i = keys[indexOf](key))) keys.splice(i, 1), values.splice(i, 1);
    }
  };
};
