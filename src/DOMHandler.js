function DOMHandler() {}
function push(array, value) {
  var i = array.indexOf(value);
  return i < 0 ? array.push(value) - 1 : i;
}
function splice(array, value) {
  var i = array.indexOf(value);
  if (-1 < i) {
    array.splice(i, 1);
  }
  return i;
}
var DOMHandlerPrototype = DOMHandler.prototype;
DOMHandlerPrototype.target =
DOMHandlerPrototype.handler = null;
DOMHandlerPrototype.on = function on(type, target, handler) {
  var
    handlers = this[type] || (this[type] = {
      target: [],
      handler: []
    }),
    i = push(handlers.target, target)
  ;
  return -1 < push(handlers.handler[i] || (handlers.handler[i] = []), handler);
};
DOMHandlerPrototype.off = function off(type, target, handler) {
  var handlers = this[type], i, j;
  if (handlers) {
    i = handlers.target.indexOf(target);
    if (-1 < i) {
      j = handlers.handler[i].indexOf(handler);
      if (-1 < j) {
        handlers.handler[i].splice(j, 1);
        if (!handlers.handler[i].length) {
          handlers.handler.splice(i, 1);
          handlers.target.splice(i, 1);
          if (!handlers.target.length) {
            delete this[type];
          }
          return true;
        }
      }
    }
  }
};
