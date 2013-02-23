var
  ws = new WeakShim,
  HTMLElementPrototype = (
    window.HTMLElement || window.Element
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

window.on =
document.on =
HTMLElementPrototype.on = function on(target, type, handler, capture) {
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
        ws.set(self, dh = new DOMHandler);
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
HTMLElementPrototype.off = function off(target, type, handler, capture) {
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

HTMLElementPrototype.css = function css(key, value) {
  var
    self = this,
    style = self.style,
    string = typeof key === 'string',
    css, list, i, out, p;
  if (string) {
    css = experimental(style, key, "css");
    if (value === undefined) {
      return css && getComputedStyle(self, null).getPropertyValue(css);
    } else if (css) {
      style.cssText += ';' + css + ':' + value;
    }
  } else {
    for (
      list = Object.keys(key),
      out = [],
      i = 0; i < list.length; i++
    ){
      if (css = experimental(style, p = list[i], "css")) {
        out.push(';', css, ':', key[p]);
      }
    }
    style.cssText += out.join('');
  }
  return self;
};

window.fire =
document.fire =
HTMLElementPrototype.fire = function fire(type, detail) {
  this.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: detail
  }));
};

document.reflow =
HTMLElementPrototype.reflow = function reflow() {
  return (document.documentElement.offsetWidth + 1) && this;
};

HTMLElementPrototype.createElement = function createElement(nodeName) {
  return this.appendChild(document.createElement(nodeName));
};

HTMLElementPrototype.remove || (
  HTMLElementPrototype.remove = function remove() {
    var parentNode = this.parentNode;
    parentNode && parentNode.removeChild(this);
    return this;
  }
);

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
        self
      ,
      capture
    );
  };
  removeDOMAsEventListener = function (target, type, self, capture) {
    target.removeEventListener(
      type,
      self._handleEvent || self,
      capture
    );
  }
}