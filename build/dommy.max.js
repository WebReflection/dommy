/*!
Copyright (C) 2013 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function(window, undefined){
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
window.CustomEvent || (window.CustomEvent = function(){
  function initCustomEvent(
    type, bubbles, cancelable, detail
  ) {
    CustomEvent.call(this, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: detail
    });
  }
  return function CustomEvent(type, eventInitDict) {
    var evt = window.document.createEvent("Event");
    if (eventInitDict) {
      evt.initEvent(type, !!eventInitDict.bubbles, !!eventInitDict.cancelable);
      evt.detail = eventInitDict.detail || null;
    } else {
      evt.initCustomEvent = initCustomEvent;
    }
    return evt;
  };
}());
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
var
  ws = new WeakShim,
  HTMLElementPrototype = (
    window.HTMLElement || window.Element
  ).prototype;

function notify(self, h, e) {
  h.handleEvent ? h.handleEvent(e) : h.call(self, e);
}

HTMLElementPrototype.handleEvent = function handleEvent(e) {
  var dh = ws.get(this),
      handlers = dh && dh[e.type],
      i, h;
  if (handlers) {
    i = handlers.target.indexOf(e.currentTarget);
    if (-1 < i) {
      for (h = handlers.handler[i], i = 0; i < h.length; notify(this, h[i++], e)){}
    }
  }
};

HTMLElementPrototype.on = function on(target, type, handler, capture) {
  if (typeof target === "string") {
    this.addEventListener(target, type, !!handler);
  } else {
    var dh = ws.get(this);
    if (!dh) {
      ws.set(this, dh = new DOMHandler);
    }
    dh.on(type, target, handler);
    target.addEventListener(type, this, !!capture);
  }
  return this;
};

HTMLElementPrototype.off = function on(target, type, handler, capture) {
  if (typeof target === "string") {
    this.removeEventListener(target, type, !!handler);
  } else {
    var dh = ws.get(this);
    if (dh && dh.off(type, target, handler)) {
      target.removeEventListener(type, this, !!capture);
      if (!Object.keys(dh).length) {
        ws['delete'](this);
      }
    }
  }
  return this;
};

HTMLElementPrototype.css = function css(key, value) {
  var
    self = this,
    style = self.style,
    css = experimental(style, key, "css");
  if (value !== undefined) {
    if (css) {
      style.cssText += ';' + css + '=' + value;
    }
    return self;
  }
  return css && getComputedStyle(self, null).getPropertyValue(css);
};

document.find = HTMLElementPrototype.find = function (css) {
  return this.querySelectorAll(css);
};var experimental = function(cache){
  /*! (C) Andrea Giammarchi - Mit Style License */
  var
    prefixes = [
      "Khtml", "khtml",
      "O",     "o",
      "MS",    "ms",
      "Moz",   "moz",
      "WebKit","Webkit", "webKit",
      "webkit",
      ""
    ],
    hasPrefix = new RegExp("\\b(?:" + prefixes.join("|").slice(0, -1) + ")\\b"),
    hasOwnProperty = cache.hasOwnProperty,
    reUp = /-([a-z])/g,
    reDown = /([A-Z])/g,
    placeUp = function (m, c) {
      return c.toUpperCase();
    },
    placeDown = function (m, c) {
      return "-" + c.toLowerCase();
    }
  ;
  function find(object, what) {
    for(var
      firstChar = what.charAt(0),
      what = what.slice(1),
      i = prefixes.length,
      key; i--;
    ) {
      key = prefixes[i];
      key += (
        key ? firstChar.toUpperCase() : firstChar
      ) + what;
      if (
        key in object ||
        ("on" + key).toLowerCase() in object
      ) return key;
    }
  }
  return function experimental(object, what, assign) {
    var
      key = (assign === "css") + what,
      result = cache[key] || (
        cache[key] = find(object, what.replace(reUp, placeUp))
      );
    switch(assign) {
      case 1:
      case true:
      // case "js":
        if (result && !hasOwnProperty.call(object, what)) {
          object[what] = object[result];
        }
        break;
      case "css":
        if (result) {
          result = result.replace(reDown, placeDown);
          if (hasPrefix.test(result)) {
            result = "-" + result;
          }
        }
        break;
    }
    return result;
  };
}({});
window.supports =
document.supports =
HTMLElementPrototype.supports = function supports(what, type) {
  var
    css = this.style && experimental(this.style, what, "css"),
    js = experimental(this, what, "js");
  switch(type) {
    case "css":
      return css;
    case "js":
      return js;
  }
  return !!(css || js);
};
var
  emtyArray = [],
  NodeListPrototype = (
    window.NodeList || document.querySelectorAll("_").constructor
  ).prototype;

function repeatForEach(method) {
  function invoke(el) {
    method.apply(el, this);
  }
  return function () {
    this.forEach(invoke, arguments);
  };
};

NodeListPrototype.every = emtyArray.every;
NodeListPrototype.filter = emtyArray.filter;
NodeListPrototype.forEach = emtyArray.forEach;
NodeListPrototype.map = emtyArray.map;
NodeListPrototype.some = emtyArray.some;

NodeListPrototype.on = repeatForEach(HTMLElementPrototype.on);
NodeListPrototype.off = repeatForEach(HTMLElementPrototype.off);
NodeListPrototype.css = repeatForEach(HTMLElementPrototype.css);
NodeListPrototype.handleEvent = repeatForEach(HTMLElementPrototype.handleEvent);

function supportsThemAll(el) {
  return el.supports.apply(el, this);
}
NodeListPrototype.supports = function supports() {
  return this.every(supportsThemAll, arguments);
};

}(this));