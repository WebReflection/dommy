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
var document = window.document;
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
var CustomEvent = window.CustomEvent || function(){
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
}();
function DOMHandler() {}
(function(DOMHandlerPrototype){
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
}(DOMHandler.prototype));

var
  ws = new WeakShim(),
  ElementPrototype = (
    window.Element || window.Node || window.HTMLElement
  ).prototype,
  splitEvents = /,\s*/,
  // noCamelCase = /^[a-z]+$/,
  addDOMAsEventListener = function (target, type, self, capture) {
    target.addEventListener(type, self, capture);
  },
  removeDOMAsEventListener = function (target, type, self, capture) {
    target.removeEventListener(type, self, capture);
  },
  dummy = document.createElement('_');

function discoverJSKey(self, key) {
  return experimental(self, key, "js") || experimental(window, key, "js") || key.toLowerCase();
}

function notify(self, h, e) {
  if (h.handleEvent) {
    h.handleEvent(e);
  } else {
    h.call(self, e);
  }
}

ElementPrototype.handleEvent = function handleEvent(e) {
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

window.on =
document.on =
ElementPrototype.on = function on(target, type, handler, capture) {
  for (var
    self = this,
    selfListener = typeof target === 'string',
    actions = (selfListener ? target : type).split(splitEvents),
    bcapture = !!(selfListener ? handler : capture),
    dh = selfListener || ws.get(self),
    key, lower,
    i = 0; i < actions.length; i++
  ) {
    key = discoverJSKey(self, actions[i]);
    /*
    noCamelCase.test(key) || (
      lower = key.toLowerCase()
    );
    */
    if (selfListener) {
      addDOMAsEventListener(self, key, type, bcapture);
      //lower && addDOMAsEventListener(self, lower, type, bcapture);
    } else {
      if (!dh) {
        ws.set(self, dh = new DOMHandler());
      }
      dh.on(key, target, handler);
      addDOMAsEventListener(target, key, self, bcapture);
      //lower && addDOMAsEventListener(target, lower, self, bcapture);
    }
  }
  return this;
};

window.off =
document.off =
ElementPrototype.off = function off(target, type, handler, capture) {
  for (var
    self = this,
    selfListener = typeof target === 'string',
    actions = (selfListener ? target : type).split(splitEvents),
    bcapture = !!(selfListener ? handler : capture),
    dh = selfListener || ws.get(self),
    key, lower,
    i = 0; i < actions.length; i++
  ) {
    key = discoverJSKey(self, actions[i]);
    /*
    noCamelCase.test(key) || (
      lower = key.toLowerCase()
    );
    */
    if (selfListener) {
      removeDOMAsEventListener(self, key, type, bcapture);
      // lower && removeDOMAsEventListener(self, lower, type, bcapture);
    } else {
      if (dh && dh.off(key, target, handler)) {
        removeDOMAsEventListener(target, key, self, bcapture);
        // lower && removeDOMAsEventListener(target, lower, self, bcapture);
        if (!Object.keys(dh).length) {
          ws['delete'](self);
        }
      }
    }
  }
  return this;
};

ElementPrototype.css = function css(key, value) {
  var
    self = this,
    style = self.style,
    string = typeof key === 'string',
    CSS, list, i, out, p;
  if (string) {
    CSS = experimental(style, key, "css");
    if (value === undefined) {
      return CSS && getComputedStyle(self, null).getPropertyValue(CSS);
    } else if (CSS) {
      style.cssText += ';' + CSS + ':' + value;
    }
  } else {
    for (
      list = Object.keys(key),
      out = [],
      i = 0; i < list.length; i++
    ){
      CSS = experimental(style, p = list[i], "css");
      if (CSS) {
        out.push(';', CSS, ':', key[p]);
      }
    }
    style.cssText += out.join('');
  }
  return self;
};

window.fire =
document.fire =
ElementPrototype.fire = function fire(type, detail) {
  this.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: detail
  }));
};

document.reflow =
ElementPrototype.reflow = function reflow() {
  return (document.documentElement.offsetWidth + 1) && this;
};

try {
  addDOMAsEventListener(dummy, '_', dummy);
} catch(e) {
  // Mozilla ... 
  addDOMAsEventListener = function (target, type, self, capture) {
    var handleEvent = self.handleEvent;
    target.addEventListener(
      type,
      handleEvent ?
        self._handleEvent || (
          self._handleEvent = handleEvent.bind(self)
        ) :
        self,
      capture
    );
  };
  removeDOMAsEventListener = function (target, type, self, capture) {
    target.removeEventListener(
      type,
      self._handleEvent || self,
      capture
    );
  };
}
function $(css, parent) {
  return (parent || document).query(css);
}
$.create = function create(nodeName) {
  return document.createElement(nodeName);
};
$.text = function text(content) {
  return document.createTextNode(content);
};
window.$ = window.query = $;
document.query = ElementPrototype.query = function find(css) {
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
    function find(object, wut) {
      for(var
        firstChar = wut.charAt(0),
        what = wut.slice(1),
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
ElementPrototype.supports = function supports(what, type, define) {
  var
    style = this.style,
    css = style && experimental(style, what, "css"),
    js = experimental(this, what, define || "js");
  switch(type) {
    case "css":
      return css;
    case "js":
      return js;
  }
  return !!(css || js);
};
(function(ElementPrototype, property, defineProperty, i){
  function ClassList(node) {
    var cl = [];
    cl._ = node;
    cl.add = add;
    cl.contains = contains;
    cl.item = item;
    cl.remove = remove;
    cl.toggle = toggle;
    update(cl);
    return cl;
  }
  function update(self) {
    self.length = 0;
    self.push.apply(
      self, self._.className.replace(/^\s+|\s+$/g, '').split(/\s+/)
    );
  }
  function setClass(self) {
    self._.className = self.join(' ');
  }
  function add(className) {
    if (!this.contains(className)) {
      this.push(className);
      setClass(this);
    }
  }
  function contains(className) {
    update(this);
    i = this.indexOf(className);
    return -1 < i;
  }
  function item(i) {
    return this[i];
  }
  function remove(className) {
    if (this.contains(className)) {
      this.splice(i, 1);
      setClass(this);
    }
  }
  function toggle(className) {
    if (this.contains(className)) {
      this.splice(i, 1);
    } else {
      this.push(className);
    }
    setClass(this);
  }
  if (!(property in ElementPrototype))
    defineProperty(
      ElementPrototype,
      property,
      {
        get: function () {
          return defineProperty(this, property, {
            value: ClassList(this)
          })[property];
        }
      }
    );
}(ElementPrototype, 'classList', Object.defineProperty));var
  emtyArray = [],
  NodeListPrototype = (
    window.NodeList || document.querySelectorAll("_").constructor
  ).prototype;

function createInvoker(method) {
  return function invoke(el) {
    method.apply(el, this);
  };
}

NodeListPrototype.every = emtyArray.every;
NodeListPrototype.filter = emtyArray.filter;
NodeListPrototype.forEach = emtyArray.forEach;
NodeListPrototype.map = emtyArray.map;
NodeListPrototype.some = emtyArray.some;

var forEachONOFF = function (method) {
  var invoke = createInvoker(method);
  return function () {
    this.forEach(invoke, arguments);
    return this;
  };
};
NodeListPrototype.on = forEachONOFF(ElementPrototype.on);
NodeListPrototype.off = forEachONOFF(ElementPrototype.off);

var forEachCSS = createInvoker(ElementPrototype.css),
    forEachDispatch = createInvoker(ElementPrototype.dispatchEvent);
NodeListPrototype.css = function css(key, value) {
  if (this.length) {
    if (value !== undefined)
      return this.forEach(forEachCSS, arguments) || this;
    return this[0].css(key);
  }
};
NodeListPrototype.fire = function fire(type, detail) {
  this.forEach(forEachDispatch, [new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: detail
  })]);
};

NodeListPrototype.reflow = document.reflow;

function supportsThemAll(el) {
  return el.supports(this);
}
NodeListPrototype.supports = function supports(what) {
  return this.every(supportsThemAll, what);
};

}(this));